"use client"

import { useState } from "react"

import { BlocksIcon, Eye, HandCoins, WalletCards } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCreatorInsights } from "@/hooks/analytics/use-creator-insights"
import { envConfig } from "@/lib/env"

type CreatorKpiStackProps = {
  handle: string | null
}

type RangeOption = "7d" | "30d" | "90d" | "all"

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

function DeltaBadge({
  delta,
}: {
  delta: { value: number; label: string; direction: "up" | "down" | "neutral" }
}) {
  const bgColor =
    delta.direction === "up"
      ? "bg-green-100 text-green-700"
      : delta.direction === "down"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700"

  const symbol =
    delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→"

  return (
    <span
      className={`${bgColor} inline-block rounded px-2 py-0.5 text-xs font-medium`}
    >
      {symbol} {delta.label}
    </span>
  )
}

function KpiSkeleton() {
  return (
    <Card className="border-border/70">
      <CardContent className="flex min-h-28 items-center justify-between p-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-36" />
        </div>
        <Skeleton className="size-8 rounded-full" />
      </CardContent>
    </Card>
  )
}

export function CreatorKpiStack({ handle }: CreatorKpiStackProps) {
  const [range] = useState<RangeOption>("30d")
  const { data, isLoading } = useCreatorInsights(handle, range)

  const cards = data
    ? [
        {
          label: "Total Profile Views",
          value: `${formatCompact(data.kpis.totalProfileViews)} Views`,
          icon: Eye,
          delta: data.kpisDeltas.totalProfileViews,
        },
        {
          label: "Confirmed Sales",
          value: `${data.kpis.confirmedSales.toLocaleString()} Purchases`,
          icon: HandCoins,
          delta: data.kpisDeltas.confirmedSales,
        },
        {
          label: "Net Earnings",
          value: `${formatUsdc(data.kpis.netEarningsUsdc)} USDC`,
          icon: WalletCards,
          delta: data.kpisDeltas.netEarningsUsdc,
        },
        {
          label: "Settlement Network",
          value: envConfig.PAYMENT_NETWORK.toUpperCase(),
          icon: BlocksIcon,
        },
      ]
    : []

  return (
    <div className="space-y-3">
      {isLoading || !data
        ? Array.from({ length: 4 }).map((_, index) => (
            <KpiSkeleton key={index} />
          ))
        : cards.map((card) => {
            const Icon = card.icon

            return (
              <Card key={card.label} className="border-border/70">
                <CardContent className="flex min-h-28 items-center justify-between p-5">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-semibold">{card.value}</p>
                      {card.delta && <DeltaBadge delta={card.delta} />}
                    </div>
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
