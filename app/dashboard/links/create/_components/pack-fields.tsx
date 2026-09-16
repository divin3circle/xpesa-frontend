"use client"

import { ChangeEvent } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { acceptedUploadTypes } from "@/lib/links/file-policy"

import { AccessControlsPanel } from "./access-controls-panel"
import { formatBytes } from "./helpers"
import type { SelectedPackFile } from "./types"

export function PackFields({
  onPackFilesSelect,
  selectedPackFiles,
  packPriceUsdc,
  setPackPriceUsdc,
  handleThumbnailChange,
}: {
  onPackFilesSelect: (files: FileList | null) => void
  selectedPackFiles: SelectedPackFile[]
  packPriceUsdc: string
  setPackPriceUsdc: (value: string) => void
  handleThumbnailChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Pack files</Label>
        <Input
          type="file"
          multiple
          accept={acceptedUploadTypes}
          onChange={(event) => onPackFilesSelect(event.target.files)}
        />
        <p className="text-xs text-muted-foreground">
          Up to 3 files, 150MB total. PDF, Office, CSV, image, and video are
          supported.
        </p>
        {selectedPackFiles.length > 0 ? (
          <div className="rounded-xl border p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              {selectedPackFiles.length} files selected
            </p>
            <ul className="mt-2 space-y-1">
              {selectedPackFiles.map((entry) => (
                <li key={entry.id}>
                  {entry.file.name} - {formatBytes(entry.file.size)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price-pack">Price (USDC)</Label>
          <Input
            id="price-pack"
            placeholder="20.00"
            value={packPriceUsdc}
            onChange={(event) => setPackPriceUsdc(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail-pack">Thumbnail</Label>
          <Input
            id="thumbnail-pack"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
        </div>
      </div>

      <AccessControlsPanel />
    </>
  )
}
