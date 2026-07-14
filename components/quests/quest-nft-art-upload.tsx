"use client"

import { useRef, useState } from "react"
import { ImagePlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function QuestNftArtUpload({
  questId,
  onUploaded,
}: {
  questId: string
  onUploaded: (imageUrl: string, imageR2Key: string) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)

  async function upload(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    setBusy(true)
    try {
      const response = await fetch(`/api/quests/${questId}/nft-art`, {
        method: "POST",
        body: formData,
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Artwork upload failed")
      onUploaded(body.imageUrl, body.imageR2Key)
      toast.success("NFT artwork uploaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Artwork upload failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="size-4" />
        {busy ? "Uploading..." : "Upload artwork"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
      />
    </div>
  )
}
