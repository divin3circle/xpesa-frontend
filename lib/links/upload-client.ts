import {
  classifyFileByExtension,
  getFileExtension,
  PACK_MAX_FILES,
  resolveMimeType,
  validatePackSelection,
  validateSingleUpload,
} from "@/lib/links/file-policy"

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

async function deriveDocumentPageCount(file: File): Promise<number | null> {
  const extension = getFileExtension(file.name)
  const mimeType = resolveMimeType(file.name, file.type)

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

export function toPackFileType(fileName: string) {
  return classifyFileByExtension(fileName)
}

export async function uploadDocumentAndFinalize(params: {
  creatorId: string
  file: File
}) {
  const validationError = validateSingleUpload(params.file)
  if (validationError) {
    throw new LinkUploadError({
      message: validationError,
      stage: "sign",
      retryable: false,
    })
  }

  const derivedPageCount = await deriveDocumentPageCount(params.file)

  const signedUpload = await requestSignedUpload({
    creatorId: params.creatorId,
    mode: "document",
    fileName: params.file.name,
    fileType: resolveMimeType(params.file.name, params.file.type),
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
    fileType: classifyFileByExtension(params.file.name),
  }
}

export async function uploadPackAndFinalize(params: {
  creatorId: string
  title?: string
  files: File[]
}) {
  const selectedFiles = params.files.slice(0, PACK_MAX_FILES)
  if (!selectedFiles.length) {
    throw new LinkUploadError({
      message: "Please add at least one file to your pack.",
      stage: "zip",
      retryable: false,
    })
  }

  const validationError = validatePackSelection(selectedFiles)
  if (validationError) {
    throw new LinkUploadError({
      message: validationError,
      stage: "sign",
      retryable: false,
    })
  }

  const uploadedFiles = []
  for (const [index, file] of selectedFiles.entries()) {
    const signedUpload = await requestSignedUpload({
      creatorId: params.creatorId,
      mode: "pack",
      fileName: file.name,
      fileType: resolveMimeType(file.name, file.type),
      fileSizeBytes: file.size,
    })

    await uploadToSignedUrl(signedUpload.uploadUrl, file, signedUpload.contentType)

    const finalized = await finalizeUpload({
      creatorId: params.creatorId,
      key: signedUpload.key,
      mode: "pack",
    })

    uploadedFiles.push({
      r2Key: finalized.r2Key,
      originalFilename: file.name,
      fileType: classifyFileByExtension(file.name),
      mimeType: finalized.contentType,
      fileSizeBytes: finalized.fileSizeBytes,
      sortOrder: index + 1,
    })
  }

  return {
    r2Key: uploadedFiles[0]?.r2Key,
    fileSizeBytes: uploadedFiles.reduce(
      (total, file) => total + file.fileSizeBytes,
      0
    ),
    fileCount: selectedFiles.length,
    files: uploadedFiles,
  }
}

export function getUploadErrorMessage(error: unknown) {
  if (error instanceof LinkUploadError) return error.message
  if (error instanceof Error) return error.message
  return "Upload failed. Please retry."
}
