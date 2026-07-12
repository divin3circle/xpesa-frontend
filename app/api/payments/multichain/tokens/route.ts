import { NextResponse } from "next/server"

import { MULTICHAIN_USDC_TOKENS, AVALANCHE_USDC } from "@/lib/payments/multichain/config"

export async function GET() {
  return NextResponse.json({
    destination: AVALANCHE_USDC,
    tokens: MULTICHAIN_USDC_TOKENS,
  })
}
