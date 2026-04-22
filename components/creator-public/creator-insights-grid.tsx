import { Card, CardContent } from "@/components/ui/card"
import type { CreatorAnalytics } from "@/lib/mock/creator-analytics"
import { renderRelevantChart } from "@/lib/utils"

type CreatorInsightsGridProps = {
  analytics: CreatorAnalytics
  activeLinks: number
}

function formatUsdc(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function CreatorInsightsGrid({
  analytics,
  activeLinks,
}: CreatorInsightsGridProps) {
  const tiles = [
    {
      label: "Active Links",
      id: "active-links",
      value: activeLinks.toLocaleString(),
    },
    {
      label: "Average Price",
      id: "average-price",
      value: formatUsdc(analytics.averagePriceUsdc),
    },
    {
      label: "Primary Content",
      id: "primary-content",
      value: analytics.topContentType,
    },
    {
      label: "Unique Supporters",
      id: "unique-supporters",
      value: analytics.uniqueSupporters.toLocaleString(),
    },
    {
      label: "Total Platform Fees",
      id: "total-fees",
      value: formatUsdc(analytics.totalFeesUsdc),
    },
    {
      label: "Conversion Rate",
      id: "conversion-rate",
      value: `${analytics.conversionRate.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}%`,
    },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((tile) => (
        <Card key={tile.label} className="border-border/70">
          <CardContent className="space-y-1 py-4">
            <div className="mt-2 px-5">
              <p className="text-xs text-muted-foreground">{tile.label}</p>
              <p className="font-heading text-3xl font-semibold tracking-tight">
                {tile.value}
              </p>
            </div>
            {renderRelevantChart(tile.id)}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
