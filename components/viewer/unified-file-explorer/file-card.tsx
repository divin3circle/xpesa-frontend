"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconFolder, IconPdf, IconFile, IconPhoto } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

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

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase()
  if (ext === "pdf")
    return <IconPdf className={cn("h-5 w-5", "text-rose-500")} />
  if (ext === "docx" || ext === "doc")
    return <IconFile className={cn("h-5 w-5", "text-blue-500")} />
  if (["jpg", "jpeg", "png", "webp"].includes(ext || ""))
    return <IconPhoto className={cn("h-5 w-5", "text-emerald-500")} />
  return <IconFolder className={cn("h-10 w-10", "text-chart-1")} />
}

export function FileCard({ file, onClick, idx = 0 }: Props) {
  return (
    <div onClick={() => onClick(file)} className="group cursor-pointer">
      <Card className="overflow-hidden border-none shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="p-0">
          <div className="flex aspect-square flex-col items-center justify-center p-10">
            <div className="relative">{getFileIcon(file.name)}</div>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="truncate font-medium">{file.name}</span>
            <Badge variant="secondary" className="text-[#6B7280]">
              {file.name.split(".").pop()?.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
