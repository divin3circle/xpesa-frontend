"use client"

import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Edit01FreeIcons } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { formatBytes, formatKesFromUsdc } from "./helpers"
import type { LinkMode, SelectedPackFile, UploadedDoc } from "./types"

export function FanPreview({
  mode,
  title,
  thumbnailDataUrl,
  activePriceUsdc,
  selectedPackFiles,
  packSummary,
  documentUpload,
}: {
  mode: LinkMode
  title: string
  thumbnailDataUrl: string
  activePriceUsdc: string
  selectedPackFiles: SelectedPackFile[]
  packSummary: { totalBytes: number; breakdown: string }
  documentUpload: UploadedDoc | null
}) {
  return (
    <Card className="border-chart-1 xl:col-span-2">
      <CardHeader>
        <CardTitle>Fan preview</CardTitle>
        <CardDescription>
          What your audience sees before payment.
        </CardDescription>
      </CardHeader>
      <CardContent className="-mt-0.5">
        <div
          onClick={() =>
            toast.info("Custom video and image thumbnail upload coming soon.")
          }
          className="group relative mb-2 cursor-pointer"
        >
          <Image
            src={thumbnailDataUrl ? thumbnailDataUrl : "/icon.png"}
            alt="Wallet"
            width={200}
            height={100}
            className="w-full rounded-2xl h-52"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/75 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <HugeiconsIcon
              icon={Edit01FreeIcons}
              className="size-5 text-chart-1"
            />
            <p className="mt-2 text-sm">Custom Thumbnail</p>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border p-4">
          <Badge>{mode === "tip" ? "Support" : "Locked content"}</Badge>
          <p className="font-medium">
            {title.trim().length > 0 ? title : "React Native Crash Course"}
          </p>
          <p className="text-sm text-muted-foreground">
            {mode === "pack"
              ? `${selectedPackFiles.length} files • ${packSummary.breakdown}`
              : mode === "document"
                ? `${documentUpload?.pageCount ?? 0} pages • secure in-browser access`
                : mode === "tip"
                  ? "Fans can choose any amount to support your work"
                  : "Complete practical guide with project files and implementation checklist."}
          </p>
          <div className="rounded-2xl bg-muted p-3 text-sm">
            <p>
              Price:{" "}
              {mode === "tip" ? "Custom amount" : activePriceUsdc || "12.00"}{" "}
              USDC
            </p>
            <p className="text-muted-foreground">
              {mode === "pack"
                ? `${formatKesFromUsdc(activePriceUsdc)} • ${formatBytes(packSummary.totalBytes)}`
                : mode === "document"
                  ? `${formatKesFromUsdc(activePriceUsdc)} • ${formatBytes(documentUpload?.fileSizeBytes ?? 0)}`
                  : formatKesFromUsdc(activePriceUsdc)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
