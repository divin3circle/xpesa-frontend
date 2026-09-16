import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  calculateDelta,
  clampRange,
  computeConversionRateByType,
  computeMetrics,
  getRangeStart,
  type CreatorInsightsResponse,
  type ErrorResponse,
  type InsightDelta,
  type LinkRow,
  type TransactionRow,
} from "@/lib/analytics/insights"

export type {
  CreatorInsightsResponse,
  ErrorResponse,
  InsightDelta,
} from "@/lib/analytics/insights"

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
      .eq("moderation_status", "approved")

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
    const conversionRateByType = computeConversionRateByType(links)

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
