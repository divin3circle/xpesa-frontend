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

const PLACEHOLDER_CARDS: InsightPlaceholderCard[] = [
  { id: "active-links", label: "Active Links" },
  { id: "average-price", label: "Average Price" },
  { id: "primary-content", label: "Primary Content" },
  { id: "unique-supporters", label: "Unique Supporters" },
  { id: "total-fees", label: "Total Platform Fees" },
  { id: "conversion-rate", label: "Conversion Rate" },
]

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
      <CardContent className="flex h-80 min-h-72 flex-col justify-between space-y-2 py-5">
        <div className="mt-2 px-5">
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className="font-heading text-3xl font-semibold tracking-tight">
            {card.value}
          </p>
        </div>
        <CreatorInsightChart id={card.id} data={card.chartData} />
      </CardContent>
    </Card>
  )
}

export function CreatorInsightsGrid({ handle }: CreatorInsightsGridProps) {
  const { data, isLoading } = useCreatorInsights(handle)

  if (isLoading || !data) {
    return (
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_CARDS.map((card) => (
          <InsightCardSkeleton key={card.id} label={card.label} />
        ))}
      </section>
    )
  }

  const cards = buildInsightCards(data)

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <InsightCardView key={card.id} card={card} />
      ))}
    </section>
  )
}
