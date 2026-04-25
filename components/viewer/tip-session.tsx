"use client"

import { HeartHandshake, Sparkles, Star, Zap } from "lucide-react"
import { toast } from "sonner"

import { ViewerHeroCard } from "@/components/viewer/viewer-hero-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TransactionManagementTable } from "@/components/ui/transaction-management-table"
import { useViewTipCheckout } from "@/hooks/use-view-tip-checkout"
import { tipTransactions, viewerTipMock } from "@/lib/mock/view"

export function TipSession() {
  const { amount, setAmount, checkout } = useViewTipCheckout("5.00")

  const handleCheckout = async () => {
    try {
      const result = await checkout.mutateAsync()
      toast.success("Support queued", {
        description: `Tip checkout for $${result.amount.toFixed(2)} will be wired to payment next.`,
      })
    } catch (err) {
      toast.error("Unable to continue", {
        description: (err as Error).message,
      })
    }
  }

  return (
    <div className="space-y-6">
      <ViewerHeroCard
        title={viewerTipMock.title}
        description={viewerTipMock.description}
        badges={["One-time tip", "Fast support", "Thank-you note"]}
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleCheckout} disabled={checkout.isPending}>
              <HeartHandshake className="mr-2 h-4 w-4" />
              {checkout.isPending ? "Preparing..." : "Send support"}
            </Button>
            <Badge variant="secondary" className="tracking-wide uppercase">
              Creator-friendly checkout
            </Badge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-border/70 bg-card/85">
            <div className="h-1.5 bg-linear-to-r from-amber-400/80 via-rose-400/65 to-orange-400/70" />
            <CardHeader className="space-y-4 border-b bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Support workspace
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A warm, low-friction page for appreciative payments.
                  </p>
                </div>
                <Badge variant="outline">Tip mode</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]">
                <div className="space-y-4 rounded-3xl border bg-[linear-gradient(180deg,hsl(var(--muted)/0.25),hsl(var(--background)))] p-5">
                  <div>
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      Suggested amount
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {viewerTipMock.suggestedAmounts.map((suggestedAmount) => (
                        <Button
                          key={suggestedAmount}
                          variant="secondary"
                          className="rounded-xl"
                          onClick={() => setAmount(String(suggestedAmount))}
                        >
                          ${suggestedAmount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      Custom amount
                    </p>
                    <Input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={checkout.isPending}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Continue to payment
                  </Button>
                </div>

                <div className="rounded-3xl border bg-background p-5">
                  <p className="text-sm font-medium">Thank-you message</p>
                  <Separator className="my-4" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {viewerTipMock.thankYouMessage}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Speed", "Instant checkout"],
                  ["Tone", "Friendly + clear"],
                  ["Outcome", "Support shown publicly"],
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
                title="Recent tips"
                description="Small support payments with a polished history list"
                transactions={tipTransactions}
                historyHref="/dashboard/transactions"
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Tip summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Short, high-trust, and emotionally clear. This page can become
                the default support flow for creators.
              </p>
              <p>Keep the copy light and let the main action stay obvious.</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Design notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Accent</span>
                <span className="font-medium">Warm and supportive</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Main CTA</span>
                <span className="font-medium">Send support</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Message</span>
                <span className="font-medium">Thank-you first</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
