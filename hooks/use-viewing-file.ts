"use client"

import { useState } from "react"

export function useViewingFile() {
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null)

  function openViewer(url: string) {
    setViewingFileUrl(url)
  }

  function closeViewer() {
    setViewingFileUrl(null)
  }

  return { viewingFileUrl, openViewer, closeViewer }
}
