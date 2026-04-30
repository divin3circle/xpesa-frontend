"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { SecurePdfViewer } from "../SecurePdfViewer"

interface Props {
  fileUrl: string
  fileName: string
  onClose: () => void
  watermark?: string
  onLoadError?: (error: unknown) => void
}

export function PdfOverlay({
  fileUrl,
  fileName,
  onClose,
  watermark,
  onLoadError,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm lg:p-10">
      <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-3xl bg-white">
        <Button
          variant="ghost"
          className="absolute top-4 right-4 z-10"
          onClick={onClose}
        >
          Close
        </Button>
        <div className="h-full w-full pt-12">
          <SecurePdfViewer
            fileUrl={fileUrl}
            walletWatermark={watermark || "Locked"}
            onLoadError={onLoadError}
          />
        </div>
      </div>
    </div>
  )
}
