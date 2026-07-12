"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

type ImageOverlayProps = {
  fileUrl: string
  fileName: string
  onCloseAction: () => void
}

export function ImageOverlay({
  fileUrl,
  fileName,
  onCloseAction,
}: ImageOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm lg:p-10">
      <div className="relative max-h-full max-w-5xl overflow-hidden rounded-2xl bg-background p-3">
        <Button
          variant="secondary"
          className="absolute top-4 right-4 z-10"
          onClick={onCloseAction}
          aria-label={`Close ${fileName}`}
        >
          Close
        </Button>
        <Image
          src={fileUrl}
          alt={fileName}
          width={1200}
          height={900}
          unoptimized
          className="max-h-[85vh] w-auto rounded-xl object-contain"
        />
      </div>
    </div>
  )
}
