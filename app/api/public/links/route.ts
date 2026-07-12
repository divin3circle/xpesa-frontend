import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export interface PublicLinkDetails {
  id: string
  creatorId: string
  created_at: string
  type: string
  title: string
  description: string | null
  document_page_count: number | null
  document_file_size_bytes: number | null
  document_thumbnail_r2_key: string | null
  pack_thumbnail_r2_key: string | null
  pack_file_count: number | null
  pack_total_size_bytes: number | null
  price_usdc: number | null
  suggested_amount_usdc: number | null
  access_expiry_type: string | null
  access_max_views: number | null
  access_wallet_binding: boolean
  doc_download_blocked: boolean
  thank_you_message: string | null
  thumbnail_url: string | null
  view_count: number
  payment_count: number
  total_earned_usdc: number
}

export interface GetPublicLinkResponse {
  link: PublicLinkDetails
}

export interface PublicLinkErrorResponse {
  error: string
  code?: string
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function toNumber(value: number | string | null) {
  if (value === null || value === undefined) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GetPublicLinkResponse | PublicLinkErrorResponse>> {
  try {
    const url = new URL(request.url)
    const linkId =
      url.searchParams.get("id")?.trim() ||
      url.searchParams.get("linkId")?.trim() ||
      ""

    if (!linkId) {
      return NextResponse.json(
        { error: "Missing link id", code: "MISSING_LINK_ID" },
        { status: 400 }
      )
    }

    if (!UUID_REGEX.test(linkId)) {
      return NextResponse.json(
        { error: "Invalid link id format", code: "INVALID_LINK_ID" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("links")
      .select(
        `
        id,
        creator_id,
        created_at,
        type,
        title,
        description,
        document_page_count,
        document_file_size_bytes,
        document_thumbnail_r2_key,
        pack_thumbnail_r2_key,
        pack_file_count,
        pack_total_size_bytes,
        price_usdc,
        suggested_amount_usdc,
        access_expiry_type,
        access_max_views,
        access_wallet_binding,
        doc_download_blocked,
        thank_you_message,
        thumbnail_url,
        view_count,
        payment_count,
        total_earned_usdc
      `
      )
      .eq("id", linkId)
      .eq("is_active", true)
      .eq("moderation_status", "approved")
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Link not found", code: "LINK_NOT_FOUND" },
          { status: 404 }
        )
      }

      console.error("[public-link-route] Query error:", error)
      return NextResponse.json(
        { error: "Failed to fetch link details", code: "LINK_QUERY_ERROR" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Link not found", code: "LINK_NOT_FOUND" },
        { status: 404 }
      )
    }

    const response: PublicLinkDetails = {
      id: data.id,
      creatorId: data.creator_id,
      created_at: data.created_at,
      type: data.type,
      title: data.title,
      description: data.description,
      document_page_count: toNumber(data.document_page_count),
      document_file_size_bytes: toNumber(data.document_file_size_bytes),
      document_thumbnail_r2_key: data.document_thumbnail_r2_key,
      pack_thumbnail_r2_key: data.pack_thumbnail_r2_key,
      pack_file_count: toNumber(data.pack_file_count),
      pack_total_size_bytes: toNumber(data.pack_total_size_bytes),
      price_usdc: toNumber(data.price_usdc),
      suggested_amount_usdc: toNumber(data.suggested_amount_usdc),
      access_expiry_type: data.access_expiry_type,
      access_max_views: toNumber(data.access_max_views),
      access_wallet_binding: Boolean(data.access_wallet_binding),
      doc_download_blocked: Boolean(data.doc_download_blocked),
      thank_you_message: data.thank_you_message,
      thumbnail_url: data.thumbnail_url,
      view_count: toNumber(data.view_count) ?? 0,
      payment_count: toNumber(data.payment_count) ?? 0,
      total_earned_usdc: toNumber(data.total_earned_usdc) ?? 0,
    }

    const { data: updatedData, error: updateError } = await supabase.rpc(
      "increment",
      { link_id: linkId, by: 1 }
    )

    if (updateError) {
      console.warn("Failed to update view count: ", error)
    } else {
      console.log("View count updated successfully!: ", updatedData)
    }

    return NextResponse.json({ link: response })
  } catch (error) {
    console.error("[public-link-route] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
