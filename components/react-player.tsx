import React from "react"
import ReactPlayer from "react-player"

function ReactVideoPlayer({
  url = "https://youtu.be/uOAHL-cOAlE?si=pqrv3tS2XJZ6Qvor",
}: {
  url: string
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/80 bg-card/40">
      <ReactPlayer
        src={url}
        className="absolute top-0 left-0 h-full w-full"
        controls={true}
        width="100%"
        height="100%"
      />
    </div>
  )
}

export default ReactVideoPlayer
