"use client"

import ReactPlayer from "react-player"
import { Button } from "@/components/ui/button"

type VideoOverlayProps = {
  fileUrl: string
  fileName: string
  onCloseAction: () => void
}

export function VideoOverlay({
  fileUrl,
  fileName,
  onCloseAction,
}: VideoOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm lg:p-10">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black">
        <Button
          variant="secondary"
          className="absolute top-4 right-4 z-10"
          onClick={onCloseAction}
          aria-label={`Close ${fileName}`}
        >
          Close
        </Button>
        <div className="aspect-video w-full">
          <ReactPlayer src={fileUrl} controls width="100%" height="100%" />
        </div>
      </div>
    </div>
  )
}
