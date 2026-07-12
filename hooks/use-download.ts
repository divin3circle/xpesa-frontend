"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

type DownloadInput = {
  tokenId: string
  filename?: string
  fileId?: string
}

function parseFilename(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null
  }

  const match = /filename="?([^";]+)"?/i.exec(contentDisposition)
  return match?.[1] ?? null
}

async function triggerDownload(response: Response, fallbackName: string) {
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = objectUrl
  anchor.download =
    parseFilename(response.headers.get("content-disposition")) ?? fallbackName

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export function useDownload() {
  const download = useMutation({
    mutationFn: async ({ tokenId, filename, fileId }: DownloadInput) => {
      if (!tokenId) {
        throw new Error("Token id is required")
      }

      if (fileId) {
        const response = await fetch(
          `/api/packs/file/${encodeURIComponent(tokenId)}/${encodeURIComponent(fileId)}`
        )
        if (!response.ok) throw new Error("Failed to prepare file download")
        const data = (await response.json()) as { signedUrl?: string }
        if (!data.signedUrl) throw new Error("Download URL is missing")

        const anchor = document.createElement("a")
        anchor.href = data.signedUrl
        anchor.download = filename ?? "download"
        anchor.rel = "noopener"
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        return
      }

      const response = await fetch(
        `/api/downloads/${encodeURIComponent(tokenId)}`
      )

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string
          retryAfterSeconds?: number
        } | null

        if (response.status === 429 || errorBody?.error === "rate_limited") {
          const retryAfterSeconds = errorBody?.retryAfterSeconds ?? 60
          throw new Error(
            `Too many download requests. Try again in ${retryAfterSeconds} seconds.`
          )
        }

        if (response.status === 403 && errorBody?.error === "expired") {
          throw new Error("Access token has expired.")
        }

        if (response.status === 404) {
          throw new Error("Download source could not be found.")
        }

        throw new Error(errorBody?.error || "Failed to download content")
      }

      await triggerDownload(response, filename ?? "download")
    },
    onSuccess: (_data, variables) => {
      toast.success("Download started", {
        description: variables.filename
          ? `${variables.filename} is being saved to your device.`
          : "Your file is being saved to your device.",
      })
    },
    onError: (error: Error) => {
      toast.error("Download failed", {
        description: error.message || "Please try again.",
      })
    },
  })

  return {
    ...download,
    isDownloading: download.isPending,
  }
}
