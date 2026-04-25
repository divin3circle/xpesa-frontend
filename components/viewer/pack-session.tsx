"use client"

import { Archive, FileStack, Loader2, PackageOpen } from "lucide-react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { ViewerHeroCard } from "@/components/viewer/viewer-hero-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionManagementTable } from "@/components/ui/transaction-management-table"
import { useViewPackUnlock } from "@/hooks/use-view-pack-unlock"
import { packTransactions, viewerPackMock } from "@/lib/mock/view"
import { cn } from "@/lib/utils"

const fileToneClasses = [
  "from-sky-500/20 to-cyan-500/10",
  "from-emerald-500/20 to-lime-500/10",
  "from-amber-500/20 to-orange-500/10",
  "from-rose-500/20 to-pink-500/10",
]

export function PackSession() {
  const params = useParams<{ tokenId: string }>()
  const tokenId = params?.tokenId
  const unlockPack = useViewPackUnlock(tokenId)

  const packData = unlockPack.data ?? null
  const hasUnlocked = !!packData

  const handleUnlock = async () => {
    try {
      const data = await unlockPack.mutateAsync()
      toast.success("Pack unlocked", {
        description: `${data.files.length} files available for download.`,
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === "Pack expired or access denied") {
        toast.error("Pack expired or access denied", {
          description:
            "This token is no longer valid or limits have been reached.",
        })
      } else {
        toast.error("Failed to unlock pack", {
          description: message,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <ViewerHeroCard
        title={viewerPackMock.title}
        description={viewerPackMock.description}
        badges={[
          `${viewerPackMock.fileCount} files`,
          viewerPackMock.totalSizeLabel,
          "Protected bundle",
        ]}
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleUnlock}
              disabled={unlockPack.isPending || hasUnlocked}
            >
              {unlockPack.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : hasUnlocked ? (
                <>
                  <FileStack className="mr-2 h-4 w-4" />
                  Pack unlocked
                </>
              ) : (
                <>
                  <PackageOpen className="mr-2 h-4 w-4" />
                  Unlock bundle
                </>
              )}
            </Button>
            <Badge variant="secondary" className="tracking-wide uppercase">
              All files gated by token
            </Badge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-border/70 bg-card/85">
            <div className="h-1.5 bg-linear-to-r from-emerald-400/70 via-cyan-400/65 to-sky-400/65" />
            <CardHeader className="space-y-4 border-b bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileStack className="h-5 w-5 text-primary" />
                    Asset grid
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A file-browser inspired pack view with clear file types.
                  </p>
                </div>
                <Badge variant="outline">Explorer style</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {(packData?.files || viewerPackMock.files).map(
                  (file, index) => (
                    <div
                      key={
                        (file as { id?: string; name?: string }).id ||
                        (file as { id?: string; name?: string }).name
                      }
                      className="group overflow-hidden rounded-3xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div
                        className={cn(
                          "flex aspect-square items-center justify-center bg-linear-to-br",
                          fileToneClasses[index % fileToneClasses.length]
                        )}
                      >
                        <div className="rounded-2xl border bg-background/70 p-4 backdrop-blur">
                          <Archive className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {"original_filename" in file
                              ? file.original_filename
                              : file.name}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-[10px] tracking-wide uppercase"
                          >
                            {"file_type" in file ? file.file_type : file.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {"size" in file ? file.size : "Unknown size"}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Preview mode", "Tiles"],
                  ["Sorting", "Newest first"],
                  ["Protection", "Watermarked downloads"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border bg-background p-4"
                  >
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-0">
              <TransactionManagementTable
                title="Pack purchases"
                description="Unlocks recorded against this bundle"
                transactions={packTransactions}
                historyHref="/dashboard/transactions"
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Bundle summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">File count</span>
                <span className="font-medium">
                  {packData?.files.length ?? viewerPackMock.fileCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">
                  {viewerPackMock.totalSizeLabel}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-medium">Protected pack</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>What users see</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                A clean browser-like grid that makes multiple assets feel easy
                to scan without exposing private download links.
              </p>
              <p>
                Pack metadata and file manifest are now fetched through the
                runtime API after wallet signature verification.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
