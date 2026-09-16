"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"

import { getPackFileId, toMbLabel, type PackFileState } from "./utils"

export function SortablePackItem({
  file,
  onRemove,
}: {
  file: PackFileState
  onRemove: (file: PackFileState) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: getPackFileId(file),
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
      className="flex items-center justify-between gap-3 rounded-2xl border p-2"
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
