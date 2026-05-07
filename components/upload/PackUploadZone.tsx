"use client"

import { useMemo, useState } from "react"
import type { ChangeEvent, DragEventHandler } from "react"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"

export type PackFileState = {
  packFileId: string | null
  originalFilename: string
  fileType: "pdf" | "image"
  fileSizeBytes: number
  pageCount?: number
  imageWidth?: number
  imageHeight?: number
  sortOrder: number
  status: "uploading" | "converting" | "ready" | "error"
  progress: number
  error?: string
  localId?: string
}

type PackUploadZoneProps = {
  files: PackFileState[]
  onFilesChangeAction: (files: PackFileState[]) => void
}

const MAX_PACK_FILES = 3
const MAX_PDF_BYTES = 50 * 1024 * 1024
const MAX_DOCX_BYTES = 20 * 1024 * 1024
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? ""
}

function toMbLabel(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validatePackFile(file: File) {
  const extension = getExtension(file.name)
  const imageExtensions = ["png", "jpg", "jpeg", "webp"]

  if (!["pdf", "docx", ...imageExtensions].includes(extension)) {
    return "Unsupported file type."
  }

  if (extension === "pdf" && file.size > MAX_PDF_BYTES) {
    return "PDF exceeds 50MB limit."
  }

  if (extension === "docx" && file.size > MAX_DOCX_BYTES) {
    return "DOCX exceeds 20MB limit."
  }

  if (imageExtensions.includes(extension) && file.size > MAX_IMAGE_BYTES) {
    return "Image exceeds 10MB limit."
  }

  return null
}

function normalizeSort(files: PackFileState[]) {
  return files.map((file, index) => ({ ...file, sortOrder: index }))
}

function SortablePackItem({
  file,
  onRemove,
}: {
  file: PackFileState
  onRemove: (file: PackFileState) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id:
        file.localId ??
        file.packFileId ??
        `${file.originalFilename}-${file.sortOrder}`,
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between gap-3 rounded-lg border p-2"
    >
      <div>
        <p className="text-sm font-medium">{file.originalFilename}</p>
        <p className="text-xs text-muted-foreground">
          {file.fileType.toUpperCase()} • {toMbLabel(file.fileSizeBytes)}
          {file.pageCount ? ` • ${file.pageCount} pages` : ""}
          {file.imageWidth && file.imageHeight
            ? ` • ${file.imageWidth}x${file.imageHeight}`
            : ""}
        </p>
        {file.status !== "ready" ? (
          <p className="text-xs text-muted-foreground">
            {file.status === "uploading"
              ? `Uploading ${file.progress}%`
              : file.status === "converting"
                ? "Converting to PDF..."
                : file.status === "error"
                  ? (file.error ?? "Upload failed")
                  : "Processing..."}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(file)}
      >
        Remove
      </Button>
    </div>
  )
}

export function PackUploadZone({
  files,
  onFilesChangeAction,
}: PackUploadZoneProps) {
  const [zoneError, setZoneError] = useState("")
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const slotCount = MAX_PACK_FILES - files.length

  const ids = useMemo(
    () =>
      files.map(
        (file) =>
          file.localId ??
          file.packFileId ??
          `${file.originalFilename}-${file.sortOrder}`
      ),
    [files]
  )

  const patchFile = (localId: string, patch: Partial<PackFileState>) => {
    onFilesChangeAction(
      normalizeSort(
        files.map((file) =>
          (file.localId ??
            file.packFileId ??
            `${file.originalFilename}-${file.sortOrder}`) === localId
            ? { ...file, ...patch }
            : file
        )
      )
    )
  }

  const pollUploadStatus = async (uploadId: string, localId: string) => {
    const poll = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/packs/upload-status/${uploadId}`)
        const data = (await response.json()) as {
          status?: string
          packFileId?: string
          fileType?: "pdf" | "image"
          pageCount?: number
          imageWidth?: number
          imageHeight?: number
          fileSizeBytes?: number
          error?: string
        }

        if (data.status === "converting") {
          patchFile(localId, { status: "converting" })
          return
        }

        if (data.status === "error" || data.error) {
          window.clearInterval(poll)
          patchFile(localId, {
            status: "error",
            error: data.error ?? "Upload failed",
          })
          return
        }

        if (data.status === "ready" && data.packFileId) {
          window.clearInterval(poll)
          patchFile(localId, {
            status: "ready",
            progress: 100,
            packFileId: data.packFileId,
            fileType: data.fileType ?? "pdf",
            pageCount: data.pageCount,
            imageWidth: data.imageWidth,
            imageHeight: data.imageHeight,
            fileSizeBytes: data.fileSizeBytes ?? 0,
          })
        }
      } catch {
        window.clearInterval(poll)
        patchFile(localId, {
          status: "error",
          error: "Failed to poll upload status",
        })
      }
    }, 2000)
  }

  const startUpload = (file: File) => {
    const validationError = validatePackFile(file)
    if (validationError) {
      setZoneError(validationError)
      return
    }

    const localId = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`
    const extension = getExtension(file.name)
    const optimisticType = ["png", "jpg", "jpeg", "webp"].includes(extension)
      ? "image"
      : "pdf"

    const nextItem: PackFileState = {
      localId,
      packFileId: null,
      originalFilename: file.name,
      fileType: optimisticType,
      fileSizeBytes: file.size,
      sortOrder: files.length,
      status: "uploading",
      progress: 0,
    }

    onFilesChangeAction(normalizeSort([...files, nextItem]))

    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      patchFile(localId, {
        status: "uploading",
        progress: Math.round((event.loaded / event.total) * 100),
      })
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return

      if (xhr.status < 200 || xhr.status >= 300) {
        patchFile(localId, { status: "error", error: "Upload failed" })
        return
      }

      try {
        const payload = JSON.parse(xhr.responseText) as {
          uploadId?: string
          packFileId?: string
          fileType?: "pdf" | "image"
          pageCount?: number
          imageWidth?: number
          imageHeight?: number
          fileSizeBytes?: number
          error?: string
        }

        if (payload.error) {
          patchFile(localId, { status: "error", error: payload.error })
          return
        }

        if (payload.packFileId) {
          patchFile(localId, {
            status: "ready",
            progress: 100,
            packFileId: payload.packFileId,
            fileType: payload.fileType ?? optimisticType,
            pageCount: payload.pageCount,
            imageWidth: payload.imageWidth,
            imageHeight: payload.imageHeight,
            fileSizeBytes: payload.fileSizeBytes ?? file.size,
          })
          return
        }

        if (payload.uploadId) {
          patchFile(localId, { status: "converting" })
          void pollUploadStatus(payload.uploadId, localId)
          return
        }

        patchFile(localId, {
          status: "error",
          error: "Invalid upload response",
        })
      } catch {
        patchFile(localId, {
          status: "error",
          error: "Could not parse response",
        })
      }
    }

    xhr.open("POST", "/api/packs/upload-file")
    xhr.send(formData)
  }

  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    const incoming = Array.from(event.dataTransfer.files ?? []).slice(
      0,
      slotCount
    )
    incoming.forEach((file) => startUpload(file))
  }

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []).slice(0, slotCount)
    incoming.forEach((file) => startUpload(file))
    event.target.value = ""
  }

  const handleRemove = async (file: PackFileState) => {
    const next = files.filter((item) => item.localId !== file.localId)
    onFilesChangeAction(normalizeSort(next))

    if (file.packFileId) {
      try {
        await fetch(`/api/packs/upload-file/${file.packFileId}`, {
          method: "DELETE",
        })
      } catch {
        // Best-effort delete; local UI already updated.
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = ids.findIndex((id) => id === active.id)
    const newIndex = ids.findIndex((id) => id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    onFilesChangeAction(normalizeSort(arrayMove(files, oldIndex, newIndex)))
  }

  return (
    <div className="space-y-2">
      <div
        className={`rounded-xl border border-dashed p-4 text-sm ${
          zoneError ? "border-destructive" : "border-border"
        }`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p>Drop pack files here, or click to browse.</p>
          <p className="text-xs text-muted-foreground">
            {files.length} / {MAX_PACK_FILES} files
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Accepted: PDF (50MB), DOCX (20MB), PNG/JPG/WEBP (10MB).
        </p>

        <div className="mt-3">
          <label className="inline-flex cursor-pointer rounded-md border px-3 py-1.5 text-xs">
            Browse files
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.docx,.png,.jpg,.jpeg,.webp"
              disabled={slotCount <= 0}
              onChange={handleSelect}
            />
          </label>
          {slotCount <= 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Pack full (3/3)
            </p>
          ) : null}
        </div>

        {zoneError ? (
          <p className="mt-2 text-xs text-destructive">{zoneError}</p>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {files.map((file) => (
              <SortablePackItem
                key={
                  file.localId ??
                  file.packFileId ??
                  `${file.originalFilename}-${file.sortOrder}`
                }
                file={file}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
