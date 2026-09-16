"use client"

import { ChangeEvent } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { acceptedUploadTypes } from "@/lib/links/file-policy"

import { AccessControlsPanel } from "./access-controls-panel"
import { formatBytes } from "./helpers"
import type { UploadedDoc } from "./types"

export function DocumentFields({
  onDocumentFileSelect,
  documentPriceUsdc,
  setDocumentPriceUsdc,
  documentUpload,
  handleThumbnailChange,
}: {
  onDocumentFileSelect: (file: File | null) => void
  documentPriceUsdc: string
  setDocumentPriceUsdc: (value: string) => void
  documentUpload: UploadedDoc | null
  handleThumbnailChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Document upload</Label>
        <Input
          type="file"
          accept={acceptedUploadTypes}
          onChange={(event) =>
            onDocumentFileSelect(event.target.files?.[0] ?? null)
          }
        />
        <p className="text-xs text-muted-foreground">
          PDF, Office, CSV, image, or video. Max 50MB.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price-document">Price (USDC)</Label>
          <Input
            id="price-document"
            placeholder="12.00"
            value={documentPriceUsdc}
            onChange={(event) => setDocumentPriceUsdc(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail-document">Thumbnail</Label>
          <Input
            id="thumbnail-document"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
        </div>
      </div>

      {documentUpload ? (
        <div className="flex items-center gap-3 rounded-xl border p-3 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">
              {documentUpload.filename}
            </p>
            <p>{documentUpload.pageCount} pages</p>
            <p>{formatBytes(documentUpload.fileSizeBytes)}</p>
          </div>
        </div>
      ) : null}

      <AccessControlsPanel showBlockDownload />
    </>
  )
}
