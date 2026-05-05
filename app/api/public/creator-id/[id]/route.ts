import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export interface GetCreatorHandleByIdResponse {
  creator: {
    id: string
    handle: string
    wallet_address: string | null
  }
}

export interface CreatorHandleByIdErrorResponse {
  error: string
  code?: string
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<GetCreatorHandleByIdResponse | CreatorHandleByIdErrorResponse>
> {
  try {
    const { id } = await params
    const creatorId = id?.trim()

    if (!creatorId) {
      return NextResponse.json(
        { error: "Missing creator id", code: "MISSING_CREATOR_ID" },
        { status: 400 }
      )
    }

    if (!UUID_REGEX.test(creatorId)) {
      return NextResponse.json(
        { error: "Invalid creator id format", code: "INVALID_CREATOR_ID" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("creators")
      .select("id, handle, wallet_address")
      .eq("id", creatorId)
      .eq("is_active", true)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Creator not found", code: "CREATOR_NOT_FOUND" },
          { status: 404 }
        )
      }

      console.error("[creator-id-route] Query error:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch creator handle",
          code: "CREATOR_QUERY_ERROR",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      creator: {
        id: data.id,
        handle: data.handle,
        wallet_address: data.wallet_address,
      },
    })
  } catch (error) {
    console.error("[creator-id-route] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
