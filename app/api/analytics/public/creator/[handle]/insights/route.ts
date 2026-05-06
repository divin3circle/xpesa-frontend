import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

type InsightRange = "7d" | "30d" | "90d" | "all"

type NumericInput = number | string | null | undefined

type LinkRow = {
  type: string | null
  is_active: boolean | null
  view_count: NumericInput
  payment_count: NumericInput
  price_usdc: NumericInput
  suggested_amount_usdc: NumericInput
}

type TransactionRow = {
  created_at: string
  amount_usdc: NumericInput
  platform_fee_usdc: NumericInput
  creator_net_usdc: NumericInput
  fan_wallet_address: string | null
  network: string | null
  link?: Array<{ type: string | null }> | null
}

type InsightPoint = {
  label: string
  value: number
}

export type InsightDelta = {
  value: number
  label: string
  direction: "up" | "down" | "neutral"
}

export interface CreatorInsightsResponse {
  creator: {
    id: string
    handle: string
  }
  range: InsightRange
  summary: {
    activeLinks: number
    averagePriceUsdc: number
    primaryContent: string
    uniqueSupporters: number
    totalPlatformFeesUsdc: number
    conversionRate: number
  }
  summaryDeltas: {
    activeLinks: InsightDelta
    averagePriceUsdc: InsightDelta
    uniqueSupporters: InsightDelta
    totalPlatformFeesUsdc: InsightDelta
    conversionRate: InsightDelta
  }
  kpis: {
    totalProfileViews: number
    confirmedSales: number
    netEarningsUsdc: number
    totalRevenueUsdc: number
    primaryNetwork: string
  }
  kpisDeltas: {
    totalProfileViews: InsightDelta
    confirmedSales: InsightDelta
    netEarningsUsdc: InsightDelta
    totalRevenueUsdc: InsightDelta
  }
  series: {
    activeLinksByType: InsightPoint[]
    averagePriceTrend: InsightPoint[]
    primaryContentBreakdown: InsightPoint[]
    uniqueSupportersTrend: InsightPoint[]
    totalFeesTrend: InsightPoint[]
    conversionRateByType: InsightPoint[]
  }
}

export interface ErrorResponse {
  error: string
  code?: string
}

const RANGE_DAYS: Record<Exclude<InsightRange, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

const RANGE_ORDER: InsightRange[] = ["7d", "30d", "90d", "all"]

function toNumber(value: NumericInput): number {
  if (value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function clampRange(input: string | null): InsightRange {
  if (!input) return "30d"
  const normalized = input.trim().toLowerCase() as InsightRange
  return RANGE_ORDER.includes(normalized) ? normalized : "30d"
}

function getRangeStart(range: InsightRange): Date | null {
  if (range === "all") return null
  const date = new Date()
  date.setDate(date.getDate() - RANGE_DAYS[range])
  return date
}

function getDayLabel(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function getTypeLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getTopEntryLabel(counter: Record<string, number>): string {
  const top = Object.entries(counter).sort((a, b) => b[1] - a[1])[0]
  if (!top) return "N/A"
  return getTypeLabel(top[0])
}

function calculateDelta(current: number, prior: number): InsightDelta {
  if (prior === 0) {
    return {
      value: current > 0 ? 100 : 0,
      label: current > 0 ? "+∞" : "0%",
      direction: current > prior ? "up" : current < prior ? "down" : "neutral",
    }
  }
  const percentChange = ((current - prior) / prior) * 100
  const direction =
    percentChange > 0.5
      ? ("up" as const)
      : percentChange < -0.5
        ? ("down" as const)
        : ("neutral" as const)
  return {
    value: Math.round(percentChange * 10) / 10,
    label: `${direction === "up" ? "+" : ""}${(Math.round(percentChange * 10) / 10).toFixed(1)}%`,
    direction,
  }
}

type ComputedMetrics = {
  activeLinksCount: number
  totalProfileViews: number
  totalPaymentsFromLinks: number
  confirmedSales: number
  totalRevenueUsdc: number
  totalPlatformFeesUsdc: number
  netEarningsUsdc: number
  averagePriceUsdc: number
  uniqueSupporters: number
  conversionRate: number
  primaryNetwork: string
  primaryContent: string
  activeLinksByType: InsightPoint[]
  primaryContentBreakdown: InsightPoint[]
  averagePriceTrend?: InsightPoint[]
  totalFeesTrend?: InsightPoint[]
  uniqueSupportersTrend?: InsightPoint[]
}

function computeMetrics(
  links: LinkRow[],
  transactions: TransactionRow[],
  includeTimeSeries: boolean = true
): ComputedMetrics {
  const activeLinks = links.filter((link) => Boolean(link.is_active))
  const activeLinksCount = activeLinks.length

  const totalProfileViews = activeLinks.reduce(
    (sum, link) => sum + toNumber(link.view_count),
    0
  )
  const totalPaymentsFromLinks = activeLinks.reduce(
    (sum, link) => sum + toNumber(link.payment_count),
    0
  )

  const confirmedSales = transactions.length
  const totalRevenueUsdc = transactions.reduce(
    (sum, tx) => sum + toNumber(tx.amount_usdc),
    0
  )
  const totalPlatformFeesUsdc = transactions.reduce(
    (sum, tx) => sum + toNumber(tx.platform_fee_usdc),
    0
  )
  const netEarningsUsdc = transactions.reduce(
    (sum, tx) => sum + toNumber(tx.creator_net_usdc),
    0
  )

  const transactionAveragePrice =
    confirmedSales > 0 ? totalRevenueUsdc / confirmedSales : 0
  const fallbackPricedLinks = activeLinks.filter(
    (link) =>
      toNumber(link.suggested_amount_usdc) > 0 || toNumber(link.price_usdc) > 0
  )
  const fallbackAveragePrice =
    fallbackPricedLinks.length > 0
      ? fallbackPricedLinks.reduce(
          (sum, link) =>
            sum +
            Math.max(
              toNumber(link.suggested_amount_usdc),
              toNumber(link.price_usdc)
            ),
          0
        ) / fallbackPricedLinks.length
      : 0
  const averagePriceUsdc =
    transactionAveragePrice > 0 ? transactionAveragePrice : fallbackAveragePrice

  const uniqueSupporters = new Set(
    transactions
      .map((tx) => tx.fan_wallet_address?.trim().toLowerCase())
      .filter(Boolean)
  ).size

  const conversionRate =
    totalProfileViews > 0
      ? (totalPaymentsFromLinks / totalProfileViews) * 100
      : 0

  const networkCounter = transactions.reduce<Record<string, number>>(
    (acc, tx) => {
      const network = tx.network?.trim()
      if (!network) return acc
      acc[network] = (acc[network] ?? 0) + 1
      return acc
    },
    {}
  )
  const primaryNetwork =
    Object.entries(networkCounter).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A"

  const activeLinksByTypeCounter = activeLinks.reduce<Record<string, number>>(
    (acc, link) => {
      const type = (link.type ?? "unknown").toLowerCase()
      acc[type] = (acc[type] ?? 0) + 1
      return acc
    },
    {}
  )

  const txByTypeCounter = transactions.reduce<Record<string, number>>(
    (acc, tx) => {
      const type = (tx.link?.[0]?.type ?? "unknown").toLowerCase()
      acc[type] = (acc[type] ?? 0) + 1
      return acc
    },
    {}
  )

  const primaryContent = getTopEntryLabel(
    Object.keys(txByTypeCounter).length > 0
      ? txByTypeCounter
      : activeLinksByTypeCounter
  )

  const activeLinksByType = Object.entries(activeLinksByTypeCounter)
    .map(([type, value]) => ({ label: getTypeLabel(type), value }))
    .sort((a, b) => b.value - a.value)

  const primaryContentBreakdown = Object.entries(
    Object.keys(txByTypeCounter).length > 0
      ? txByTypeCounter
      : activeLinksByTypeCounter
  )
    .map(([type, value]) => ({ label: getTypeLabel(type), value }))
    .sort((a, b) => b.value - a.value)

  const metrics: ComputedMetrics = {
    activeLinksCount,
    totalProfileViews,
    totalPaymentsFromLinks,
    confirmedSales,
    totalRevenueUsdc,
    totalPlatformFeesUsdc,
    netEarningsUsdc,
    averagePriceUsdc,
    uniqueSupporters,
    conversionRate,
    primaryNetwork,
    primaryContent,
    activeLinksByType,
    primaryContentBreakdown,
  }

  if (includeTimeSeries) {
    const dailyRollup = transactions.reduce<
      Record<
        string,
        { amount: number; fees: number; supporters: Set<string>; count: number }
      >
    >((acc, tx) => {
      const key = tx.created_at.slice(0, 10)
      if (!acc[key]) {
        acc[key] = {
          amount: 0,
          fees: 0,
          supporters: new Set<string>(),
          count: 0,
        }
      }

      acc[key].amount += toNumber(tx.amount_usdc)
      acc[key].fees += toNumber(tx.platform_fee_usdc)
      acc[key].count += 1

      const wallet = tx.fan_wallet_address?.trim().toLowerCase()
      if (wallet) acc[key].supporters.add(wallet)

      return acc
    }, {})

    const sortedDayKeys = Object.keys(dailyRollup).sort().slice(-7)

    metrics.averagePriceTrend = sortedDayKeys.map((dayKey) => {
      const day = dailyRollup[dayKey]
      return {
        label: getDayLabel(dayKey),
        value: day.count > 0 ? day.amount / day.count : 0,
      }
    })

    metrics.totalFeesTrend = sortedDayKeys.map((dayKey) => ({
      label: getDayLabel(dayKey),
      value: dailyRollup[dayKey].fees,
    }))

    metrics.uniqueSupportersTrend = sortedDayKeys.map((dayKey) => ({
      label: getDayLabel(dayKey),
      value: dailyRollup[dayKey].supporters.size,
    }))
  }

  return metrics
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
): Promise<NextResponse<CreatorInsightsResponse | ErrorResponse>> {
  try {
    const { handle } = await params
    const normalizedHandle = handle?.trim().toLowerCase()
    const range = clampRange(new URL(request.url).searchParams.get("range"))

    if (!normalizedHandle) {
      return NextResponse.json(
        { error: "Invalid creator handle", code: "INVALID_HANDLE" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id, handle")
      .eq("handle", normalizedHandle)
      .eq("is_active", true)
      .single()

    if (creatorError || !creator) {
      const status = creatorError?.code === "PGRST116" ? 404 : 500
      return NextResponse.json(
        {
          error:
            creatorError?.code === "PGRST116"
              ? "Creator not found"
              : "Failed to fetch creator",
          code:
            creatorError?.code === "PGRST116"
              ? "CREATOR_NOT_FOUND"
              : "CREATOR_QUERY_ERROR",
        },
        { status }
      )
    }

    const { data: linksData, error: linksError } = await supabase
      .from("links")
      .select(
        "type, is_active, view_count, payment_count, price_usdc, suggested_amount_usdc"
      )
      .eq("creator_id", creator.id)

    if (linksError) {
      console.error("[creator-insights-route] links query error:", linksError)
      return NextResponse.json(
        { error: "Failed to fetch links", code: "LINKS_QUERY_ERROR" },
        { status: 500 }
      )
    }

    const links: LinkRow[] = linksData ?? []
    const txRangeStart = getRangeStart(range)
    const priorRangeStart = getRangeStart(range)
    const priorRangeEnd = txRangeStart

    // Fetch current period transactions
    let txQuery = supabase
      .from("transactions")
      .select(
        "created_at, amount_usdc, platform_fee_usdc, creator_net_usdc, fan_wallet_address, network, link:links(type)"
      )
      .eq("creator_id", creator.id)
      .eq("status", "confirmed")

    if (txRangeStart) {
      txQuery = txQuery.gte("created_at", txRangeStart.toISOString())
    }

    const { data: txData, error: txError } = await txQuery

    if (txError) {
      console.error("[creator-insights-route] tx query error:", txError)
      return NextResponse.json(
        {
          error: "Failed to fetch transactions",
          code: "TRANSACTIONS_QUERY_ERROR",
        },
        { status: 500 }
      )
    }

    const transactions: TransactionRow[] = (txData ?? []) as TransactionRow[]
    const currentMetrics = computeMetrics(links, transactions, true)

    // Fetch prior period transactions for deltas
    let priorTxQuery = supabase
      .from("transactions")
      .select(
        "created_at, amount_usdc, platform_fee_usdc, creator_net_usdc, fan_wallet_address, network, link:links(type)"
      )
      .eq("creator_id", creator.id)
      .eq("status", "confirmed")

    if (priorRangeStart && priorRangeEnd) {
      priorTxQuery = priorTxQuery.gte(
        "created_at",
        priorRangeStart.toISOString()
      )
      priorTxQuery = priorTxQuery.lt("created_at", priorRangeEnd.toISOString())
    } else if (priorRangeStart && !priorRangeEnd) {
      // For 'all' range, get prior period transactions from a year ago (or equivalent)
      const priorDate = new Date(priorRangeStart)
      priorDate.setFullYear(priorDate.getFullYear() - 1)
      priorTxQuery = priorTxQuery.gte("created_at", priorDate.toISOString())
      priorTxQuery = priorTxQuery.lt(
        "created_at",
        priorRangeStart.toISOString()
      )
    }

    const { data: priorTxData } = await priorTxQuery
    const priorTransactions: TransactionRow[] = (priorTxData ??
      []) as TransactionRow[]
    const priorMetrics = computeMetrics(links, priorTransactions, false)

    // Calculate deltas
    const summaryDeltas = {
      activeLinks: calculateDelta(
        currentMetrics.activeLinksCount,
        priorMetrics.activeLinksCount
      ),
      averagePriceUsdc: calculateDelta(
        currentMetrics.averagePriceUsdc,
        priorMetrics.averagePriceUsdc
      ),
      uniqueSupporters: calculateDelta(
        currentMetrics.uniqueSupporters,
        priorMetrics.uniqueSupporters
      ),
      totalPlatformFeesUsdc: calculateDelta(
        currentMetrics.totalPlatformFeesUsdc,
        priorMetrics.totalPlatformFeesUsdc
      ),
      conversionRate: calculateDelta(
        currentMetrics.conversionRate,
        priorMetrics.conversionRate
      ),
    }

    const kpisDeltas = {
      totalProfileViews: calculateDelta(
        currentMetrics.totalProfileViews,
        priorMetrics.totalProfileViews
      ),
      confirmedSales: calculateDelta(
        currentMetrics.confirmedSales,
        priorMetrics.confirmedSales
      ),
      netEarningsUsdc: calculateDelta(
        currentMetrics.netEarningsUsdc,
        priorMetrics.netEarningsUsdc
      ),
      totalRevenueUsdc: calculateDelta(
        currentMetrics.totalRevenueUsdc,
        priorMetrics.totalRevenueUsdc
      ),
    }

    // Compute conversionRateByType from current metrics
    const conversionByTypeAccumulator = links.reduce<
      Record<string, { views: number; payments: number }>
    >((acc, link) => {
      const type = (link.type ?? "unknown").toLowerCase()
      if (!acc[type]) {
        acc[type] = { views: 0, payments: 0 }
      }
      acc[type].views += toNumber(link.view_count)
      acc[type].payments += toNumber(link.payment_count)
      return acc
    }, {})

    const conversionRateByType = Object.entries(conversionByTypeAccumulator)
      .map(([type, values]) => ({
        label: getTypeLabel(type),
        value: values.views > 0 ? (values.payments / values.views) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)

    return NextResponse.json({
      creator: {
        id: creator.id,
        handle: creator.handle,
      },
      range,
      summary: {
        activeLinks: currentMetrics.activeLinksCount,
        averagePriceUsdc: currentMetrics.averagePriceUsdc,
        primaryContent: currentMetrics.primaryContent,
        uniqueSupporters: currentMetrics.uniqueSupporters,
        totalPlatformFeesUsdc: currentMetrics.totalPlatformFeesUsdc,
        conversionRate: currentMetrics.conversionRate,
      },
      summaryDeltas,
      kpis: {
        totalProfileViews: currentMetrics.totalProfileViews,
        confirmedSales: currentMetrics.confirmedSales,
        netEarningsUsdc: currentMetrics.netEarningsUsdc,
        totalRevenueUsdc: currentMetrics.totalRevenueUsdc,
        primaryNetwork: currentMetrics.primaryNetwork,
      },
      kpisDeltas,
      series: {
        activeLinksByType: currentMetrics.activeLinksByType,
        averagePriceTrend: currentMetrics.averagePriceTrend ?? [],
        primaryContentBreakdown: currentMetrics.primaryContentBreakdown,
        uniqueSupportersTrend: currentMetrics.uniqueSupportersTrend ?? [],
        totalFeesTrend: currentMetrics.totalFeesTrend ?? [],
        conversionRateByType,
      },
    })
  } catch (error) {
    console.error("[creator-insights-route] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
