"use client"

import { useEffect, useState } from "react"
import { Download, FileText, ImageIcon } from "lucide-react"

import {
  isImageFile,
  parseAnswerFiles,
  type QuestAnswerFile,
} from "@/lib/quests/answer-files"

/**
 * Renders a quest file-answer (image thumbnails + document download chips) using
 * short-lived presigned URLs from the private answer-file endpoint.
 */
export function QuestFileAnswer({
  questId,
  answer,
  ownerId,
}: {
  questId: string
  answer: string
  ownerId?: string | null
}) {
  const files = parseAnswerFiles(answer)
  if (!files.length) {
    return <p className="text-sm text-muted-foreground">No files</p>
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {files.map((file) => (
        <FileChip
          key={file.key}
          questId={questId}
          file={file}
          ownerId={ownerId}
        />
      ))}
    </div>
  )
}

function FileChip({
  questId,
  file,
  ownerId,
}: {
  questId: string
  file: QuestAnswerFile
  ownerId?: string | null
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const q = new URLSearchParams({ key: file.key })
    if (ownerId) q.set("ownerId", ownerId)
    fetch(`/api/quests/${questId}/answers/file?${q.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("forbidden"))))
      .then((d) => {
        if (active) setUrl(String(d.url))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [questId, file.key, ownerId])

  const image = isImageFile(file)

  return (
    <a
      href={url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-2xl border p-2 transition hover:bg-muted/40"
    >
      {image && url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={file.name}
          className="size-12 rounded-lg object-cover"
        />
      ) : (
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">
          {image ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {(file.size / 1024 / 1024).toFixed(1)} MB
        </p>
      </div>
      <Download className="size-4 shrink-0 text-muted-foreground" />
    </a>
  )
}
