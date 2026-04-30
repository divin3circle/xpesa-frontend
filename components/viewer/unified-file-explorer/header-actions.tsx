"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkBadge01Icon,
  Download01FreeIcons,
} from "@hugeicons/core-free-icons"

interface Props {
  title: string
  filesCount: number
  isAuthorized: boolean
  isWrongWallet: boolean
  onConfirm: () => void
  onDownload?: () => void
  isAuthorizing?: boolean
  isDownloading?: boolean
}

export function HeaderActions({
  title,
  filesCount,
  isAuthorized,
  isWrongWallet,
  onConfirm,
  onDownload,
  isAuthorizing = false,
  isDownloading = false,
}: Props) {
  return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">
          {isAuthorized ? title : "Content locked"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAuthorized
            ? `${filesCount} item${filesCount === 1 ? "" : "s"}`
            : "Confirm access to reveal the files inside."}
        </p>
      </div>
      <div className="flex gap-3">
        {!isAuthorized && (
          <Button
            onClick={onConfirm}
            className="rounded-xl shadow-none"
            disabled={isAuthorizing || isWrongWallet}
          >
            <HugeiconsIcon icon={CheckmarkBadge01Icon} />
            {isAuthorizing ? "Confirming..." : "Confirm Access"}
          </Button>
        )}
        {isAuthorized && onDownload && (
          <Button
            size="sm"
            variant={"ghost"}
            onClick={onDownload}
            disabled={isAuthorizing || isDownloading}
            className="flex items-center gap-2 rounded-xl border-border/50 shadow-none"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <HugeiconsIcon icon={Download01FreeIcons} />
            )}
            {isDownloading ? "Downloading..." : "Download All"}
          </Button>
        )}
      </div>
    </div>
  )
}
