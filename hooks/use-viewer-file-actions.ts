"use client"

import { toast } from "sonner"

import type { FileItem } from "@/hooks/use-unified-file-explorer"
import type { PageAccessResponse, PackAccessResponse } from "./use-unlock-token"

type DownloadMutation = {
  mutateAsync: (input: {
    tokenId: string
    filename: string
    fileId?: string
  }) => Promise<unknown>
}

export function useViewerFileActions({
  unlockedContent,
  openViewer,
  download,
  tokenId,
  linkType,
  title,
}: {
  unlockedContent: PageAccessResponse | PackAccessResponse | null
  openViewer: (url: string) => void
  download: DownloadMutation
  tokenId: string
  linkType: "document" | "pack"
  title: string
}) {
  async function getPackFileUrl(file: FileItem) {
    const response = await fetch(
      `/api/packs/file/${encodeURIComponent(tokenId)}/${encodeURIComponent(file.id)}`
    )

    if (!response.ok) {
      throw new Error("Failed to load pack file")
    }

    const data = (await response.json()) as { signedUrl?: string }
    if (!data.signedUrl) throw new Error("Pack file URL is missing")
    return data.signedUrl
  }

  async function onOpen(file: FileItem) {
    if (!unlockedContent) {
      toast.warning("Please confirm access to view this file")
      return
    }

    if (!["pdf", "image", "video"].includes(file.type)) {
      toast.info("Download required", {
        description: "This file type is not previewable in the browser yet.",
      })
      return
    }

    if (linkType === "pack") {
      openViewer(await getPackFileUrl(file))
      return
    }

    const previewUrl =
      "pageCount" in unlockedContent ? unlockedContent.previewUrl : null
    if (previewUrl) openViewer(previewUrl)
  }

  function handlePreviewLoadError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    if (/429|too many requests/i.test(message)) {
      toast.error("Too many preview requests", {
        description: "Try again in a minute.",
      })
      return
    }
    toast.error("Failed to load preview", {
      description: message || "Please try again.",
    })
  }

  function handleDownloadFile(file: FileItem) {
    void download
      .mutateAsync({
        tokenId,
        fileId: linkType === "pack" ? file.id : undefined,
        filename: file.name || title,
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        toast.error(message || "Failed to download content")
      })
  }

  return { onOpen, handlePreviewLoadError, handleDownloadFile }
}
