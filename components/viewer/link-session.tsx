"use client"

import { useParams } from "next/navigation"
import {
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { ViewerHeroCard } from "@/components/viewer/viewer-hero-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TransactionManagementTable } from "@/components/ui/transaction-management-table"
import { useViewLinkUnlock } from "@/hooks/use-view-link-unlock"
import { linkTransactions, viewerLinkMock } from "@/lib/mock/view"

export function LinkSession() {
  const params = useParams<{ tokenId: string }>()
  const tokenId = params?.tokenId
  const unlock = useViewLinkUnlock(tokenId)

  const destinationUrl = unlock.data?.destinationUrl ?? null

  const handleUnlock = async () => {
    try {
      const data = await unlock.mutateAsync()

      toast.success("Link unlocked", {
        description: "Redirecting to destination...",
      })

      setTimeout(() => {
        window.location.href = data.destinationUrl
      }, 1000)
    } catch (err) {
      const message = (err as Error).message
      if (message === "Link expired") {
        toast.error("Link expired", {
          description: "This token is no longer valid.",
        })
      } else {
        toast.error("Failed to unlock link", {
          description: message,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <ViewerHeroCard
        title={viewerLinkMock.title}
        description={viewerLinkMock.description}
        badges={[
          viewerLinkMock.destinationHost,
          "Protected destination",
          "Copy-ready",
        ]}
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleUnlock} disabled={unlock.isPending}>
              {unlock.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Unlock and open
                </>
              )}
            </Button>
            <Badge variant="secondary" className="tracking-wide uppercase">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Secure redirect
            </Badge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-border/70 bg-card/85">
            <div className="h-1.5 bg-linear-to-r from-cyan-400/75 via-sky-400/70 to-emerald-400/70" />
            <CardHeader className="space-y-4 border-b bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    Redirect record
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Private destination metadata styled like a link file card.
                  </p>
                </div>
                <Badge variant="outline">Token protected</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(250px,0.5fr)]">
                <div className="space-y-4 rounded-3xl border bg-[linear-gradient(180deg,hsl(var(--muted)/0.25),hsl(var(--background)))] p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {destinationUrl ? (
                      <>
                        <Badge variant="secondary">unlocked</Badge>
                        <Badge variant="outline">Ready to open</Badge>
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary">destination.link</Badge>
                        <Badge variant="outline">Locked</Badge>
                      </>
                    )}
                  </div>
                  <div className="rounded-2xl border bg-background p-3">
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      Canonical URL
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        readOnly
                        value={
                          destinationUrl ||
                          `https://${viewerLinkMock.destinationHost}/launch/secure`
                        }
                        className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const url =
                            destinationUrl ||
                            `https://${viewerLinkMock.destinationHost}/launch/secure`
                          navigator.clipboard.writeText(url)
                          toast.success("Copied to clipboard")
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      ["Scheme", "HTTPS"],
                      ["Visibility", "Private"],
                      ["Target", viewerLinkMock.destinationHost],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border bg-background p-3"
                      >
                        <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border bg-background p-5">
                  <p className="text-sm font-medium">Unlock state</p>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">
                    {destinationUrl
                      ? "Link is now accessible. You can open or copy it."
                      : viewerLinkMock.previewLabel}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-0">
              <TransactionManagementTable
                title="Link unlock history"
                description="A clean list of who paid to reveal this destination"
                transactions={linkTransactions}
                historyHref="/dashboard/links"
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Redirect policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Token access is checked through the secure route.</p>
              <p>2. Wallet and policy constraints are verified.</p>
              <p>3. Destination link is resolved from encrypted storage.</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Workspace cues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Explorer card language keeps this mode visually aligned.
              </p>
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Host</span>
                <span className="font-medium">
                  {viewerLinkMock.destinationHost}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-medium">Link unlock</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">CTA</span>
                <span className="font-medium">
                  {viewerLinkMock.destinationLabel}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
