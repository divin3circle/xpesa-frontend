import { NextRequest, NextResponse } from "next/server"

import { getFiatProvider } from "@/lib/payments/providers"

/**
 * GET /api/payments/fiat/rate?destination=KES — live display rate (fiat per USDC)
 * for the withdraw (offramp) UI. Uses the provider's selling rate. Display-only;
 * the authoritative quote is computed server-side when the withdrawal is created.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const destination = (searchParams.get("destination") ?? "KES").toUpperCase()

  try {
    const quote = await getFiatProvider().getOfframpQuote({
      amountUsdc: 1,
      fiatCurrency: destination,
    })
    return NextResponse.json({
      data: { rate: quote.rate, rateId: `${destination}-${Date.now()}` },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Rate unavailable",
      },
      { status: 502 }
    )
  }
}
