"use client"

import type { FileItem } from "@/hooks/use-unified-file-explorer"
import { FileCard } from "./file-card"

export function LockedFilesPreview({
  files,
  linkType,
  onFileClick,
}: {
  files: FileItem[]
  linkType: "document" | "pack"
  onFileClick: (file: FileItem) => void
}) {
  return (
    <section className="my-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="mt-4 font-sans text-xl font-semibold">
          {linkType === "pack" ? "Folder Contents" : "Included Assets"}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {files.map((file) => (
          <div key={file.id}>
            <FileCard file={file} onClick={onFileClick} />
          </div>
        ))}
      </div>
    </section>
  )
}
