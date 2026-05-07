"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"

type UploadState =
  | "idle"
  | "uploading"
  | "converting"
  | "processing"
  | "ready"
  | "error"

export type UploadedDoc = {
  r2Key: string
  thumbnailUrl: string
  pageCount: number
  fileSizeBytes: number
  filename: string
}

type DocumentUploadZoneProps = {
  onRemoveAction: () => void
  onUploadCompleteAction: (result: UploadedDoc) => void
  onUploadErrorAction: (error: string) => void
  value: UploadedDoc | null
}

const MAX_PDF_BYTES = 50 * 1024 * 1024
const MAX_DOCX_BYTES = 20 * 1024 * 1024

function getFileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? ""
}

function validateDocument(file: File) {
  const extension = getFileExtension(file.name)
  if (!["pdf", "docx"].includes(extension)) {
    return "Only PDF or DOCX files are allowed."
  }

  if (extension === "pdf" && file.size > MAX_PDF_BYTES) {
    return "PDF exceeds 50MB limit."
  }

  if (extension === "docx" && file.size > MAX_DOCX_BYTES) {
    return "DOCX exceeds 20MB limit."
  }

  return null
}

export function DocumentUploadZone({
  value,
  onUploadCompleteAction,
  onUploadErrorAction,
  onRemoveAction,
}: DocumentUploadZoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>(
    value ? "ready" : "idle"
  )
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentFilename, setCurrentFilename] = useState("")

  const inputRef = useRef<HTMLInputElement | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const resetState = () => {
    setUploadState("idle")
    setProgress(0)
    setErrorMessage("")
    setCurrentFilename("")
  }

  const pollStatus = async (
    uploadId: string,
    filename: string,
    fallbackFileSize: number
  ) => {
    const poll = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/docs/upload-status/${uploadId}`)
        const statusData = (await response.json()) as {
          status?: string
          r2Key?: string
          thumbnailUrl?: string
          pageCount?: number
          fileSizeBytes?: number
          error?: string
        }

        if (statusData.status === "converting") {
          setUploadState("converting")
          return
        }

        if (statusData.status === "processing") {
          setUploadState("processing")
          return
        }

        if (statusData.status === "error" || statusData.error) {
          window.clearInterval(poll)
          setUploadState("error")
          setErrorMessage(statusData.error ?? "Document processing failed.")
          onUploadErrorAction(statusData.error ?? "Document processing failed.")
          return
        }

        if (statusData.status === "ready" && statusData.r2Key) {
          window.clearInterval(poll)
          const nextValue: UploadedDoc = {
            r2Key: statusData.r2Key,
            thumbnailUrl: statusData.thumbnailUrl ?? "",
            pageCount: statusData.pageCount ?? 1,
            fileSizeBytes: statusData.fileSizeBytes ?? fallbackFileSize,
            filename,
          }
          setUploadState("ready")
          onUploadCompleteAction(nextValue)
        }
      } catch {
        window.clearInterval(poll)
        setUploadState("error")
        setErrorMessage("Network error while polling upload status.")
        onUploadErrorAction("Network error while polling upload status.")
      }
    }, 2000)
  }

  const startUpload = (file: File) => {
    const validationError = validateDocument(file)
    if (validationError) {
      setUploadState("error")
      setErrorMessage(validationError)
      onUploadErrorAction(validationError)
      return
    }

    setCurrentFilename(file.name)
    setUploadState("uploading")
    setProgress(0)
    setErrorMessage("")

    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      setProgress(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return

      if (xhr.status < 200 || xhr.status >= 300) {
        setUploadState("error")
        setErrorMessage("Failed to upload document.")
        onUploadErrorAction("Failed to upload document.")
        return
      }

      try {
        const payload = JSON.parse(xhr.responseText) as {
          uploadId?: string
          r2Key?: string
          thumbnailUrl?: string
          pageCount?: number
          fileSizeBytes?: number
          status?: string
          error?: string
        }

        if (payload.error) {
          setUploadState("error")
          setErrorMessage(payload.error)
          onUploadErrorAction(payload.error)
          return
        }

        if (payload.r2Key) {
          const nextValue: UploadedDoc = {
            r2Key: payload.r2Key,
            thumbnailUrl: payload.thumbnailUrl ?? "",
            pageCount: payload.pageCount ?? 1,
            fileSizeBytes: payload.fileSizeBytes ?? file.size,
            filename: file.name,
          }
          setUploadState("ready")
          onUploadCompleteAction(nextValue)
          return
        }

        if (payload.uploadId) {
          setUploadState(
            payload.status === "converting" ? "converting" : "processing"
          )
          void pollStatus(payload.uploadId, file.name, file.size)
          return
        }

        setUploadState("error")
        setErrorMessage("Upload response was invalid.")
        onUploadErrorAction("Upload response was invalid.")
      } catch {
        setUploadState("error")
        setErrorMessage("Could not parse upload response.")
        onUploadErrorAction("Could not parse upload response.")
      }
    }

    xhr.open("POST", "/api/docs/upload")
    xhr.send(formData)
  }

  const handleSelectFile = (file?: File | null) => {
    if (!file) return
    startUpload(file)
  }

  const cancelUpload = () => {
    xhrRef.current?.abort()
    setUploadState("idle")
    setProgress(0)
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    if (
      uploadState === "uploading" ||
      uploadState === "converting" ||
      uploadState === "processing"
    ) {
      return
    }
    const file = event.dataTransfer.files?.[0]
    handleSelectFile(file)
  }

  if (value && uploadState === "ready") {
    return (
      <div className="rounded-xl border p-3 text-sm">
        <p className="font-medium">{value.filename}</p>
        <p className="text-muted-foreground">
          {value.pageCount} pages •{" "}
          {(value.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => {
            onRemoveAction()
            resetState()
          }}
        >
          Remove
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(event) => handleSelectFile(event.target.files?.[0])}
      />

      <div
        className={`rounded-xl border border-dashed p-4 text-sm ${
          uploadState === "error" ? "border-destructive" : "border-border"
        }`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        {(uploadState === "idle" || uploadState === "error") && (
          <div className="space-y-2">
            <p>Drop PDF or Word doc here, or click to browse.</p>
            <p className="text-xs text-muted-foreground">
              Accepted: PDF up to 50MB, DOCX up to 20MB.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Browse file
            </Button>
            {uploadState === "error" ? (
              <p className="text-xs text-destructive">{errorMessage}</p>
            ) : null}
          </div>
        )}

        {uploadState === "uploading" && (
          <div className="space-y-2">
            <p>Uploading {currentFilename}</p>
            <div className="h-2 w-full rounded bg-muted">
              <div
                className="h-2 rounded bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{progress}%</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelUpload}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {uploadState === "converting" && (
          <p className="text-xs text-muted-foreground">Converting to PDF...</p>
        )}

        {uploadState === "processing" && (
          <p className="text-xs text-muted-foreground">Generating preview...</p>
        )}
      </div>
    </div>
  )
}
