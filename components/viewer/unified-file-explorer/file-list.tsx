"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { IconSearch, IconFilter } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { FileItem } from "@/hooks/use-unified-file-explorer"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01FreeIcons } from "@hugeicons/core-free-icons"
import { getFileIcon } from "./file-card"

interface Props {
  files: FileItem[]
  onFileClick: (file: FileItem) => void
  isAuthorized: boolean
}

export function FileList({ files, onFileClick, isAuthorized }: Props) {
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-background/50 p-8 text-center">
        <p className="text-base font-semibold">Preview locked</p>
        <Image
          src="/preview.png"
          alt="Preview locked"
          width={300}
          height={200}
          className="my-6"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Confirm access to reveal the file list, sizes, and download options.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-sans text-xl font-semibold">All Files</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search file..."
              className="h-10 w-64 rounded-xl border-border/70 bg-transparent pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-border/70"
          >
            <IconFilter className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/70 text-muted-foreground">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="hidden px-6 py-4 font-medium md:table-cell">
                File Size
              </th>
              <th className="hidden px-6 py-4 font-medium lg:table-cell">
                Modified
              </th>
              <th className="px-6 py-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {files.map((file) => (
              <tr
                key={file.id}
                className="group cursor-pointer transition-colors hover:bg-border/70"
                onClick={() => onFileClick(file)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={getFileIcon(file.type)}
                      alt={getFileIcon(file.name)}
                      width={64}
                      height={64}
                      className="h-8 w-8 rounded-md"
                    />
                    <span className="font-medium">{file.name}</span>
                  </div>
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                  {file.size || "—"}
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                  {file.modified || "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg opacity-100 group-hover:opacity-100 md:opacity-0"
                  >
                    <HugeiconsIcon icon={Download01FreeIcons} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
