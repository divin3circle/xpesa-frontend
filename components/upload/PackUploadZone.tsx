"use client"

import { useMemo, useState } from "react"
import type { ChangeEvent, DragEventHandler } from "react"
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"

import { PackDropzone } from "./pack/PackDropzone"
import { PackFileList } from "./pack/PackFileList"
import {
  MAX_PACK_FILES,
  getExtension,
  getPackFileId,
  normalizeSort,
  validatePackFile,
  type PackFileState,
} from "./pack/utils"

export type { PackFileState }

type PackUploadZoneProps = {
  files: PackFileState[]
  onFilesChangeAction: (files: PackFileState[]) => void
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

  const ids = useMemo(() => files.map((file) => getPackFileId(file)), [files])

  const patchFile = (localId: string, patch: Partial<PackFileState>) => {
    onFilesChangeAction(
      normalizeSort(
        files.map((file) =>
          getPackFileId(file) === localId ? { ...file, ...patch } : file
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
      <PackDropzone
        files={files}
        slotCount={slotCount}
        zoneError={zoneError}
        onDrop={handleDrop}
        onSelect={handleSelect}
      />

      <PackFileList
        files={files}
        ids={ids}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onRemove={handleRemove}
      />
    </div>
  )
}
