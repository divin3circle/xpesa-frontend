import { NextRequest, NextResponse } from "next/server"

import { fiatQuoteRequestSchema } from "@/lib/payments/fiat"
import { getFiatProvider } from "@/lib/payments/providers"

export async function POST(request: NextRequest) {
  try {
    const input = fiatQuoteRequestSchema.parse(await request.json())
    const quote = await getFiatProvider().getOnrampQuote(input)
    return NextResponse.json({
      quote: { ...quote, fiatCurrency: input.fiatCurrency },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create quote",
      },
      { status: 400 }
    )
  }
}
