"use client"

import { useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreatorInsightChart } from "@/components/creator-public/creator-insight-chart"
import { useCreatorInsights } from "@/hooks/analytics/use-creator-insights"
import {
  buildInsightCards,
  type InsightCard,
  type InsightCardId,
} from "@/lib/analytics/creator-insights"

type CreatorInsightsGridProps = {
  handle: string | null
}

type InsightPlaceholderCard = {
  id: InsightCardId
  label: string
}

type RangeOption = "7d" | "30d" | "90d" | "all"

const PLACEHOLDER_CARDS: InsightPlaceholderCard[] = [
  { id: "active-links", label: "Active Links" },
  { id: "average-price", label: "Average Price" },
  { id: "primary-content", label: "Primary Content" },
  { id: "unique-supporters", label: "Unique Supporters" },
  { id: "total-fees", label: "Total Platform Fees" },
  { id: "conversion-rate", label: "Conversion Rate" },
]

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" },
]

function DeltaBadge({
  delta,
}: {
  delta: { value: number; label: string; direction: "up" | "down" | "neutral" }
}) {
  const bgColor =
    delta.direction === "up"
      ? "bg-chart-1/10 text-green-700"
      : delta.direction === "down"
        ? "bg-destructive/10 text-red-700"
        : "bg-gray-100/60 text-gray-900"

  const symbol =
    delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→"

  return (
    <span
      className={`${bgColor} inline-block rounded px-2 py-1 text-xs font-medium`}
    >
      {symbol} {delta.label}
    </span>
  )
}

function InsightCardSkeleton({ label }: { label: string }) {
  return (
    <Card className="border-border/70">
      <CardContent className="min-h-52 space-y-4 py-5">
        <div className="mt-2 px-5">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Skeleton className="mt-2 h-8 w-28" />
        </div>
        <div className="px-2">
          <Skeleton className="h-28 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function InsightCardView({ card }: { card: InsightCard }) {
  return (
    <Card className="border-border/70">
      <CardContent className="flex min-h-80 flex-col justify-between space-y-2 py-5">
        <div className="mt-2 px-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            {card.delta && <DeltaBadge delta={card.delta} />}
          </div>
          <p className="font-heading text-3xl font-semibold">{card.value}</p>
        </div>
        <CreatorInsightChart id={card.id} data={card.chartData} />
      </CardContent>
    </Card>
  )
}

export function CreatorInsightsGrid({ handle }: CreatorInsightsGridProps) {
  const [range, setRange] = useState<RangeOption>("30d")
  const { data, isLoading } = useCreatorInsights(handle, range)

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="mt-4 flex gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              disabled
              className="rounded px-3 py-1 text-sm font-medium opacity-50"
            >
              {option.label}
            </button>
          ))}
        </div>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEHOLDER_CARDS.map((card) => (
            <InsightCardSkeleton key={card.id} label={card.label} />
          ))}
        </section>
      </div>
    )
  }

  const cards = buildInsightCards(data)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setRange(option.value)}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              range === option.value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <InsightCardView key={card.id} card={card} />
        ))}
      </section>
    </div>
  )
}
