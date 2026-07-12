import { NextRequest, NextResponse } from "next/server"

import { fiatQuoteRequestSchema } from "@/lib/payments/fiat"
import { getKotaniFiatQuote } from "@/lib/payments/kotani"

export async function POST(request: NextRequest) {
  try {
    const input = fiatQuoteRequestSchema.parse(await request.json())
    const quote = await getKotaniFiatQuote(input)
    return NextResponse.json({ quote })
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
