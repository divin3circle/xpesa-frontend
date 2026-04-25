import Image from "next/image"

import { SecurePdfViewer } from "@/components/viewer/SecurePdfViewer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { viewerDocumentMock } from "@/lib/mock/view"

export function DocumentReaderPane({
  status,
  pageUrls,
  watermarkText,
  walletAddress,
  onOpen,
  onReset,
}: {
  status: "idle" | "loading" | "ready"
  pageUrls: string[]
  watermarkText: string
  walletAddress: string
  onOpen: () => void
  onReset: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onOpen} disabled={status === "loading"}>
          {status === "loading" ? "Opening..." : "Open document"}
        </Button>
        <Button variant="secondary" onClick={onReset}>
          Reset session
        </Button>
      </div>

      {status === "ready" && pageUrls[0] ? (
        <SecurePdfViewer
          fileUrl={pageUrls[0]}
          walletWatermark={watermarkText}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {viewerDocumentMock.pages.map((page, index) => (
              <div
                key={page.label}
                className={cn(
                  "group overflow-hidden rounded-3xl border bg-card shadow-sm transition-all",
                  index === 0 && "ring-2 ring-primary/40"
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
                  <Image
                    src={page.preview}
                    alt={page.label}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-sm font-medium">{page.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Page {index + 1} of {viewerDocumentMock.pageCount}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border bg-background p-4">
            <p className="text-sm font-medium">Access checklist</p>
            <Separator className="my-4" />
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Wallet: {walletAddress}</p>
              <p>Signature: verified locally</p>
              <p>Watermark: {watermarkText || "Pending"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
