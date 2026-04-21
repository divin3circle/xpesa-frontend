import JSZip from "jszip"

export type UploadMode = "document" | "pack"
type UploadStage = "sign" | "upload" | "finalize" | "zip"

type SignedUploadResponse = {
  uploadUrl: string
  key: string
  contentType: string
}

type FinalizeUploadResponse = {
  success: true
  r2Key: string
  key: string
  fileSizeBytes: number
  contentType: string
  mode: UploadMode
}

type ApiErrorBody = {
  error?: string
}

export class LinkUploadError extends Error {
  stage: UploadStage
  status?: number
  retryable: boolean

  constructor(params: {
    message: string
    stage: UploadStage
    status?: number
    retryable?: boolean
  }) {
    super(params.message)
    this.name = "LinkUploadError"
    this.stage = params.stage
    this.status = params.status
    this.retryable = params.retryable ?? false
  }
}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

function resolveDocumentMimeType(file: File) {
  if (file.type) return file.type

  const extension = getExtension(file.name)
  if (extension === "pdf") return "application/pdf"
  if (extension === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }

  return "application/octet-stream"
}

async function deriveDocumentPageCount(file: File): Promise<number | null> {
  const extension = getExtension(file.name)
  const mimeType = resolveDocumentMimeType(file)

  // DOCX pagination depends on renderer/layout settings. Persist unknown as null.
  if (extension !== "pdf" && mimeType !== "application/pdf") {
    return null
  }

  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
    const data = await file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages

    await loadingTask.destroy()

    if (Number.isFinite(pageCount) && pageCount > 0) {
      return pageCount
    }

    return null
  } catch {
    return null
  }
}

function statusMessage(stage: UploadStage, status: number) {
  if (stage === "sign") {
    if (status === 400) return "File type is not supported for this link mode."
    if (status === 413)
      return "This file is too large for the current upload limit."
    if (status === 500) return "Upload service is temporarily unavailable."
  }

  if (stage === "finalize") {
    if (status === 403)
      return "Upload ownership verification failed. Please retry."
    if (status === 413) return "Uploaded file exceeded the server size limit."
    if (status === 422) {
      return "Uploaded file failed validation. Ensure file type and content are valid."
    }
    if (status === 500)
      return "Could not verify upload. Please retry in a moment."
  }

  if (stage === "upload") {
    if (status === 403) return "Upload link expired. Please retry the upload."
    if (status >= 500) return "Object storage is temporarily unavailable."
  }

  return "Upload failed. Please retry."
}

function isCorsFailure(error: unknown) {
  if (!(error instanceof TypeError)) return false
  return /failed to fetch|networkerror/i.test(error.message)
}

function corsUploadMessage() {
  return "Upload blocked by object storage CORS policy. Add your app origin to R2 CORS (for example http://localhost:3000) and allow PUT/OPTIONS with Content-Type headers."
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 429 || status >= 500
}

function isRetryableError(error: unknown) {
  if (error instanceof LinkUploadError) return error.retryable
  return true
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetry<T>(
  operation: () => Promise<T>,
  options: { attempts: number; delayMs: number }
) {
  let lastError: unknown

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const canRetry = attempt < options.attempts && isRetryableError(error)
      if (!canRetry) break
      await delay(options.delayMs * attempt)
    }
  }

  throw lastError
}

async function parseErrorBody(response: Response) {
  return (await response.json().catch(() => null)) as ApiErrorBody | null
}

async function requestSignedUpload(payload: {
  creatorId: string
  mode: UploadMode
  fileName?: string
  fileType?: string
  fileSizeBytes?: number
}) {
  return withRetry(
    async () => {
      const response = await fetch("/api/links/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await parseErrorBody(response)
        throw new LinkUploadError({
          message: body?.error ?? statusMessage("sign", response.status),
          stage: "sign",
          status: response.status,
          retryable: isRetryableStatus(response.status),
        })
      }

      return (await response.json()) as SignedUploadResponse
    },
    { attempts: 2, delayMs: 300 }
  )
}

async function uploadToSignedUrl(
  uploadUrl: string,
  body: Blob,
  contentType: string
) {
  return withRetry(
    async () => {
      let response: Response
      try {
        response = await fetch(uploadUrl, {
          method: "PUT",
          body,
          headers: {
            "Content-Type": contentType,
          },
        })
      } catch (error) {
        if (isCorsFailure(error)) {
          throw new LinkUploadError({
            message: corsUploadMessage(),
            stage: "upload",
            retryable: false,
          })
        }

        throw error
      }

      if (!response.ok) {
        throw new LinkUploadError({
          message: statusMessage("upload", response.status),
          stage: "upload",
          status: response.status,
          retryable: isRetryableStatus(response.status),
        })
      }
    },
    { attempts: 2, delayMs: 300 }
  )
}

async function finalizeUpload(payload: {
  creatorId: string
  key: string
  mode: UploadMode
}) {
  return withRetry(
    async () => {
      const response = await fetch("/api/links/finalize-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await parseErrorBody(response)
        throw new LinkUploadError({
          message: body?.error ?? statusMessage("finalize", response.status),
          stage: "finalize",
          status: response.status,
          retryable: isRetryableStatus(response.status),
        })
      }

      return (await response.json()) as FinalizeUploadResponse
    },
    { attempts: 2, delayMs: 300 }
  )
}

export function toPackFileType(fileName: string): "pdf" | "image" {
  const extension = getExtension(fileName)
  return ["png", "jpg", "jpeg", "webp"].includes(extension) ? "image" : "pdf"
}

export async function uploadDocumentAndFinalize(params: {
  creatorId: string
  file: File
}) {
  const derivedPageCount = await deriveDocumentPageCount(params.file)

  const signedUpload = await requestSignedUpload({
    creatorId: params.creatorId,
    mode: "document",
    fileName: params.file.name,
    fileType: resolveDocumentMimeType(params.file),
    fileSizeBytes: params.file.size,
  })

  await uploadToSignedUrl(
    signedUpload.uploadUrl,
    params.file,
    signedUpload.contentType
  )

  const finalized = await finalizeUpload({
    creatorId: params.creatorId,
    key: signedUpload.key,
    mode: "document",
  })

  return {
    r2Key: finalized.r2Key,
    pageCount: derivedPageCount,
    fileSizeBytes: finalized.fileSizeBytes,
    filename: params.file.name,
  }
}

export async function uploadPackAndFinalize(params: {
  creatorId: string
  title?: string
  files: File[]
}) {
  if (!params.files.length) {
    throw new LinkUploadError({
      message: "Please add at least one file to your pack.",
      stage: "zip",
      retryable: false,
    })
  }

  const selectedFiles = params.files.slice(0, 3)
  const zip = new JSZip()

  selectedFiles.forEach((file) => {
    zip.file(file.name, file)
  })

  let zipBlob: Blob
  try {
    zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
    })
  } catch {
    throw new LinkUploadError({
      message: "Failed to prepare your pack for upload. Please try again.",
      stage: "zip",
      retryable: true,
    })
  }

  const safeTitle =
    params.title?.trim().replace(/[^a-zA-Z0-9-_]/g, "-") || "pack"
  const signedUpload = await requestSignedUpload({
    creatorId: params.creatorId,
    mode: "pack",
    fileName: `${safeTitle}.zip`,
    fileType: "application/zip",
    fileSizeBytes: zipBlob.size,
  })

  await uploadToSignedUrl(
    signedUpload.uploadUrl,
    zipBlob,
    signedUpload.contentType
  )

  const finalized = await finalizeUpload({
    creatorId: params.creatorId,
    key: signedUpload.key,
    mode: "pack",
  })

  return {
    r2Key: finalized.r2Key,
    fileSizeBytes: finalized.fileSizeBytes,
    fileCount: selectedFiles.length,
  }
}

export function getUploadErrorMessage(error: unknown) {
  if (error instanceof LinkUploadError) return error.message
  if (error instanceof Error) return error.message
  return "Upload failed. Please retry."
}
