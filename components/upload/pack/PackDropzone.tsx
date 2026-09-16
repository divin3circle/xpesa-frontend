"use client"

import type { ChangeEvent, DragEventHandler } from "react"

import { MAX_PACK_FILES, type PackFileState } from "./utils"

export function PackDropzone({
  files,
  slotCount,
  zoneError,
  onDrop,
  onSelect,
}: {
  files: PackFileState[]
  slotCount: number
  zoneError: string
  onDrop: DragEventHandler<HTMLDivElement>
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div
      className={`rounded-xl border border-dashed p-4 text-sm ${
        zoneError ? "border-destructive" : "border-border"
      }`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
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
            onChange={onSelect}
          />
        </label>
        {slotCount <= 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">Pack full (3/3)</p>
        ) : null}
      </div>

      {zoneError ? (
        <p className="mt-2 text-xs text-destructive">{zoneError}</p>
      ) : null}
    </div>
  )
}
