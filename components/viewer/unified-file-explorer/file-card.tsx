"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

type FileItem = {
  id: string
  name: string
  type: string
}

interface Props {
  file: FileItem
  onClick: (file: FileItem) => void
  idx?: number
}

function getFileIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()

  switch (ext) {
    case "pdf":
      return "/pdf.avif"
    case "docx":
      return "/docx.avif"
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "/image.avif"
    case "zip":
      return "/zip.avif"
    default:
      return "/unknown.avif"
  }
}

export function FileCard({ file, onClick }: Props) {
  return (
    <div onClick={() => onClick(file)} className="group">
      <Card className="cursor-pointer overflow-hidden border-none">
        <CardContent className="p-0">
          <div className="flex flex-col items-start justify-center px-4">
            <Image
              src={getFileIcon(file.type)}
              alt={getFileIcon(file.name)}
              width={64}
              height={64}
              className="rounded-md"
            />
          </div>
          <div className="-mt-2 flex flex-col items-start justify-between p-4">
            <span className="truncate font-medium">{file.name}</span>
            <Badge
              variant="secondary"
              className="text-xs text-muted-foreground"
            >
              {file.type}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
