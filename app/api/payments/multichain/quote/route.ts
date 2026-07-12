import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { prepareMultichainBridgeQuote } from "@/lib/payments/multichain/bridge"
import { getValidPaidLink } from "@/lib/payments/multichain/link"
import { multichainQuoteRequestSchema } from "@/lib/payments/multichain/schema"

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  try {
    const input = multichainQuoteRequestSchema.parse(await request.json())
    await getValidPaidLink({
      supabase,
      linkId: input.linkId,
      amountUsdc: input.amountUsdc,
    })

    const route = await prepareMultichainBridgeQuote(input)
    return NextResponse.json({ route })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Quote unavailable" },
      { status: 400 }
    )
  }
}
