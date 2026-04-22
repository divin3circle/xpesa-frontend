import { Eye, HandCoins, WalletCards, BlocksIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { CreatorAnalytics } from "@/lib/mock/creator-analytics"

type CreatorKpiStackProps = {
  analytics: CreatorAnalytics
}

function formatCompact(value: number) {
  return Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatUsdc(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function CreatorKpiStack({ analytics }: CreatorKpiStackProps) {
  const cards = [
    {
      label: "Total Profile Views",
      value: `${formatCompact(analytics.totalProfileViews)} Views`,
      icon: Eye,
    },
    {
      label: "Confirmed Sales",
      value: `${analytics.confirmedSales.toLocaleString()} Purchases`,
      icon: HandCoins,
    },
    {
      label: "Net Earnings",
      value: `${formatUsdc(analytics.netEarningsUsdc)} USDC`,
      icon: WalletCards,
    },
    {
      label: "Settlement Network",
      value: "Stellar Network",
      icon: BlocksIcon,
    },
  ]

  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.label} className="border-border/70">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-xl font-semibold">{card.value}</p>
              </div>

              <div className="rounded-full border border-border/70 p-2 text-muted-foreground">
                <Icon className="size-4" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
