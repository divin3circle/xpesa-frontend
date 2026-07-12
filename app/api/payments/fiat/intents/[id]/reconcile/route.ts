import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { settleFiatPaymentIntent } from "@/lib/payments/kotani"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

  try {
    const access = await settleFiatPaymentIntent({
      supabase,
      paymentIntentId: id,
      requestHeaders: request.headers,
    })

    return NextResponse.json({ access })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to reconcile intent",
      },
      { status: 500 }
    )
  }
}
