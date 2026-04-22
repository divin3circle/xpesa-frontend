// app/api/public/creator/[handle]/route.ts
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export interface CreatorPublicProfile {
  id: string
  display_name: string
  handle: string
  bio: string | null
  avatar_url: string | null
}

export interface LinkPublic {
  id: string
  type: string
  title: string
  description: string | null
  price_usdc: number | null
  suggested_amount_usdc: number | null
  access_expiry_type: string | null
  access_max_views: number | null
  access_wallet_binding: boolean | null
  document_page_count: number | null
  document_thumbnail_r2_key: string | null
  pack_thumbnail_r2_key: string | null
  pack_file_count: number | null
  thumbnail_url: string | null
  view_count: number
  payment_count: number
}

export interface GetCreatorResponse {
  creator: CreatorPublicProfile
  links: LinkPublic[]
}

export interface ErrorResponse {
  error: string
  code?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
): Promise<NextResponse<GetCreatorResponse | ErrorResponse>> {
  try {
    const { handle } = await params

    if (!handle || typeof handle !== "string" || handle.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid creator handle", code: "INVALID_HANDLE" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id, display_name, handle, bio, avatar_url")
      .eq("handle", handle.toLowerCase())
      .eq("is_active", true)
      .single()

    if (creatorError) {
      console.error("[creator-route] Creator query error:", creatorError)

      if (creatorError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Creator not found", code: "CREATOR_NOT_FOUND" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: "Failed to fetch creator", code: "CREATOR_QUERY_ERROR" },
        { status: 500 }
      )
    }

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found", code: "CREATOR_NOT_FOUND" },
        { status: 404 }
      )
    }

    const { data: linksData, error: linksError } = await supabase
      .from("links")
      .select(
        `
        id,
        type,
        title,
        description,
        price_usdc,
        suggested_amount_usdc,
        access_expiry_type,
        access_max_views,
        access_wallet_binding,
        document_page_count,
        document_thumbnail_r2_key,
        pack_thumbnail_r2_key,
        pack_file_count,
        thumbnail_url,
        view_count,
        payment_count
      `
      )
      .eq("creator_id", creator.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (linksError) {
      console.error("[creator-route] Links query error:", linksError)
    }

    const links = linksData ?? []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      console.error("[creator-route] NEXT_PUBLIC_SUPABASE_URL not set")
      return NextResponse.json(
        { error: "Server configuration error", code: "CONFIG_ERROR" },
        { status: 500 }
      )
    }

    const avatarUrl = creator.avatar_url
      ? `${supabaseUrl}/storage/v1/object/public/${creator.avatar_url}`
      : null

    return NextResponse.json<GetCreatorResponse>({
      creator: {
        ...creator,
        avatar_url: avatarUrl,
      },
      links,
    })
  } catch (error) {
    console.error("[creator-route] Unexpected error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
