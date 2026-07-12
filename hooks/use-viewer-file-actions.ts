"use client"

import { toast } from "sonner"

import type { FileItem } from "@/hooks/use-unified-file-explorer"
import type { PageAccessResponse, PackAccessResponse } from "./use-unlock-token"

type DownloadMutation = {
  mutateAsync: (input: { tokenId: string; filename: string }) => Promise<unknown>
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
  function onOpen(file: FileItem) {
    if (!unlockedContent) {
      toast.warning("Please confirm access to view this file")
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
        filename: linkType === "pack" ? `${title}.zip` : file.name || title,
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        toast.error(message || "Failed to download content")
      })
  }

  return { onOpen, handlePreviewLoadError, handleDownloadFile }
}
