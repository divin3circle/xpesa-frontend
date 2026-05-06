import type {
  CreatorInsightsResponse,
  InsightDelta,
} from "@/app/api/analytics/public/creator/[handle]/insights/route"

export type InsightCardId =
  | "active-links"
  | "average-price"
  | "primary-content"
  | "unique-supporters"
  | "total-fees"
  | "conversion-rate"

export type InsightChartPoint = {
  label: string
  value: number
}

export type InsightCard = {
  id: InsightCardId
  label: string
  value: string
  chartData: InsightChartPoint[]
  delta?: InsightDelta
}

export type KpiCard = {
  label: string
  value: string
  delta?: InsightDelta
}

function formatUsdc(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatPercent(value: number) {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

export function buildInsightCards(
  insights: CreatorInsightsResponse
): InsightCard[] {
  return [
    {
      id: "active-links",
      label: "Active Links",
      value: insights.summary.activeLinks.toLocaleString(),
      chartData: insights.series.activeLinksByType,
      delta: insights.summaryDeltas.activeLinks,
    },
    {
      id: "average-price",
      label: "Average Price",
      value: formatUsdc(insights.summary.averagePriceUsdc),
      chartData: insights.series.averagePriceTrend,
      delta: insights.summaryDeltas.averagePriceUsdc,
    },
    {
      id: "primary-content",
      label: "Primary Content",
      value: insights.summary.primaryContent,
      chartData: insights.series.primaryContentBreakdown,
    },
    {
      id: "unique-supporters",
      label: "Unique Supporters",
      value: insights.summary.uniqueSupporters.toLocaleString(),
      chartData: insights.series.uniqueSupportersTrend,
      delta: insights.summaryDeltas.uniqueSupporters,
    },
    {
      id: "total-fees",
      label: "Total Platform Fees",
      value: formatUsdc(insights.summary.totalPlatformFeesUsdc),
      chartData: insights.series.totalFeesTrend,
      delta: insights.summaryDeltas.totalPlatformFeesUsdc,
    },
    {
      id: "conversion-rate",
      label: "Conversion Rate",
      value: formatPercent(insights.summary.conversionRate),
      chartData: insights.series.conversionRateByType,
      delta: insights.summaryDeltas.conversionRate,
    },
  ]
}
