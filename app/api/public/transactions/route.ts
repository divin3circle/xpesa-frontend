import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export type PublicTransactionStatus = "confirmed" | "pending" | "failed"

export interface PublicTransaction {
  id: string
  created_at: string
  link_id: string
  creator_id: string
  fan_wallet_address: string
  tx_hash: string | null
  network: string
  amount_usdc: number
  platform_fee_usdc: number
  creator_net_usdc: number
  status: PublicTransactionStatus
}

export interface GetPublicTransactionsResponse {
  transactions: PublicTransaction[]
}

export interface PublicTransactionsErrorResponse {
  error: string
  code?: string
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function asNumber(value: number | string | null) {
  if (value === null || value === undefined) return 0
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function hasInvalidUuid(value: string | null) {
  if (!value) return false
  return !UUID_REGEX.test(value)
}

export async function GET(
  request: NextRequest
): Promise<
  NextResponse<GetPublicTransactionsResponse | PublicTransactionsErrorResponse>
> {
  try {
    const { searchParams } = new URL(request.url)

    const id = searchParams.get("id")?.trim() ?? null
    const creatorId = searchParams.get("creatorId")?.trim() ?? null
    const linkId = searchParams.get("linkId")?.trim() ?? null
    const status = searchParams.get("status")?.trim() ?? null
    const limitRaw = Number(searchParams.get("limit") ?? "20")
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 100)
      : 20

    if (
      hasInvalidUuid(id) ||
      hasInvalidUuid(creatorId) ||
      hasInvalidUuid(linkId)
    ) {
      return NextResponse.json(
        { error: "Invalid UUID parameter", code: "INVALID_UUID" },
        { status: 400 }
      )
    }

    if (
      status &&
      status !== "confirmed" &&
      status !== "pending" &&
      status !== "failed"
    ) {
      return NextResponse.json(
        { error: "Invalid status filter", code: "INVALID_STATUS" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    let query = supabase
      .from("transactions")
      .select(
        "id, created_at, link_id, creator_id, fan_wallet_address, tx_hash, network, amount_usdc, platform_fee_usdc, creator_net_usdc, status"
      )
      .order("created_at", { ascending: false })
      .limit(limit)

    if (id) query = query.eq("id", id)
    if (creatorId) query = query.eq("creator_id", creatorId)
    if (linkId) query = query.eq("link_id", linkId)
    if (status) query = query.eq("status", status)

    const { data, error } = await query

    if (error) {
      console.error("[public-transactions-route] Query error:", error)
      return NextResponse.json(
        { error: "Failed to fetch transactions", code: "QUERY_ERROR" },
        { status: 500 }
      )
    }

    const transactions: PublicTransaction[] = (data ?? []).map((item) => ({
      id: item.id,
      created_at: item.created_at,
      link_id: item.link_id,
      creator_id: item.creator_id,
      fan_wallet_address: item.fan_wallet_address,
      tx_hash: item.tx_hash,
      network: item.network,
      amount_usdc: asNumber(item.amount_usdc),
      platform_fee_usdc: asNumber(item.platform_fee_usdc),
      creator_net_usdc: asNumber(item.creator_net_usdc),
      status: item.status as PublicTransactionStatus,
    }))

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[public-transactions-route] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
