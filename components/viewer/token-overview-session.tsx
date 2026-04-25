import Link from "next/link"
import {
  ArrowRight,
  FileText,
  HeartHandshake,
  Link2,
  Lock,
  PackageOpen,
  ShieldCheck,
} from "lucide-react"

import { ViewerHeroCard } from "@/components/viewer/viewer-hero-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TransactionManagementTable } from "@/components/ui/transaction-management-table"
import { overviewTransactions, viewerOverviewMock } from "@/lib/mock/view"

const modes = [
  {
    href: "/document",
    title: "Document",
    description: "A secure PDF reader with a polished file-browser preview.",
    icon: FileText,
    accent: "from-sky-500/20 to-cyan-500/10",
  },
  {
    href: "/link",
    title: "Link",
    description:
      "A protected destination card with unlock state and copy actions.",
    icon: Link2,
    accent: "from-emerald-500/20 to-lime-500/10",
  },
  {
    href: "/pack",
    title: "Pack",
    description: "A bundled file vault with explorer-style asset tiles.",
    icon: PackageOpen,
    accent: "from-amber-500/20 to-orange-500/10",
  },
  {
    href: "/tip",
    title: "Tip",
    description:
      "A creator support screen with fast presets and gratitude copy.",
    icon: HeartHandshake,
    accent: "from-rose-500/20 to-pink-500/10",
  },
]

export function TokenOverviewSession({ tokenId }: { tokenId: string }) {
  return (
    <div className="space-y-6">
      <ViewerHeroCard
        title={viewerOverviewMock.title}
        description={viewerOverviewMock.description}
        badges={[
          viewerOverviewMock.tokenLabel,
          `Expires in ${viewerOverviewMock.expiresIn}`,
          viewerOverviewMock.viewsRemaining
            ? `${viewerOverviewMock.viewsRemaining} views left`
            : "Unlimited views",
        ]}
        footer={
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Button asChild>
              <Link href={`/view/${tokenId}/document`}>
                Open the document view
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <span className="text-muted-foreground">
              {viewerOverviewMock.accessNote}
            </span>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {modes.map((mode) => {
              const Icon = mode.icon
              return (
                <Card
                  key={mode.title}
                  className="group overflow-hidden border-border/70 bg-card/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`h-1.5 bg-linear-to-r ${mode.accent}`} />
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-13 w-13 items-center justify-center rounded-2xl border bg-muted/25">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="tracking-wide uppercase"
                      >
                        Protected
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{mode.title}</CardTitle>
                      <CardDescription>{mode.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      asChild
                      className="w-full justify-between rounded-xl"
                    >
                      <Link href={`/view/${tokenId}${mode.href}`}>
                        Open {mode.title.toLowerCase()}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Token guardrails</CardTitle>
              <CardDescription>
                Security traits available across all content modes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background p-4">
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Wallet binding
                </p>
                <p className="mt-2 text-sm font-medium">
                  Signed wallet session
                </p>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  URL lifetime
                </p>
                <p className="mt-2 text-sm font-medium">
                  Short-lived signed links
                </p>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Access checks
                </p>
                <p className="mt-2 text-sm font-medium">
                  Redis + DB validation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/85">
            <CardHeader>
              <CardTitle>Session snapshot</CardTitle>
              <CardDescription>
                A compact overview of what this token unlocks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Protected routes</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Primary mode</span>
                <span className="font-medium">Document</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                <span className="text-muted-foreground">Design style</span>
                <span className="font-medium">Explorer + glass</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/85">
            <CardHeader>
              <CardTitle className="text-lg">Access policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Private routes are token-scoped and wallet-aware.
              </p>
              <p className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Signed URL windows reduce shareability risk.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/70 bg-card/80">
        <CardContent className="p-0">
          <TransactionManagementTable
            title="Recent token activity"
            description="A live-ready table slot for openings, tips, purchases, and unlocks"
            transactions={overviewTransactions}
            historyHref="/dashboard/transactions"
          />
        </CardContent>
      </Card>
    </div>
  )
}
