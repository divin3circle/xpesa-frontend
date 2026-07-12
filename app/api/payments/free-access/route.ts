import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  createFreeAccessToken,
  isFreeAccessLink,
} from "@/lib/payments/free-access"

export async function POST(request: NextRequest) {
  try {
    const { linkId } = await request.json()
    if (!linkId) {
      return NextResponse.json({ error: "linkId is required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: link, error } = await supabase
      .from("links")
      .select("id, type, price_usdc, suggested_amount_usdc")
      .eq("id", linkId)
      .eq("is_active", true)
      .eq("moderation_status", "approved")
      .single()

    if (error || !link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    if (!isFreeAccessLink(link)) {
      return NextResponse.json(
        { error: "This link requires payment" },
        { status: 422 }
      )
    }

    return NextResponse.json(await createFreeAccessToken({ supabase, link }))
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create access",
      },
      { status: 500 }
    )
  }
}
