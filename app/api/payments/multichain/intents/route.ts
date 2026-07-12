import { NextRequest, NextResponse } from "next/server"

import { envConfig } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  findMultichainToken,
  AVALANCHE_USDC,
} from "@/lib/payments/multichain/config"
import { getValidPaidLink } from "@/lib/payments/multichain/link"
import { multichainIntentRequestSchema } from "@/lib/payments/multichain/schema"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  try {
    const input = multichainIntentRequestSchema.parse(await request.json())
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "payment_multichain",
      identity: input.payerWalletAddress,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const source = findMultichainToken(input.sourceChainId)
    if (!source) throw new Error("Unsupported source chain")

    const link = await getValidPaidLink({
      supabase,
      linkId: input.linkId,
      amountUsdc: input.amountUsdc,
    })

    const { data: intent, error } = await supabase
      .from("bridge_payment_intents")
      .insert({
        link_id: link.id,
        creator_id: link.creator_id,
        payer_wallet_address: input.payerWalletAddress,
        status: "quoted",
        amount_usdc: input.amountUsdc,
        source_chain_id: source.chainId,
        source_token_address: source.tokenAddress,
        source_amount_wei: input.originAmountWei,
        destination_chain_id: AVALANCHE_USDC.chainId,
        destination_token_address: AVALANCHE_USDC.tokenAddress,
        destination_amount_wei: input.destinationAmountWei,
        platform_wallet_address: envConfig.PLATFORM_WALLET_ADDRESS,
        route: input.route,
      })
      .select()
      .single()

    if (error || !intent) {
      throw new Error(error?.message || "Failed to create bridge intent")
    }

    return NextResponse.json({ intent })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid bridge intent",
      },
      { status: 400 }
    )
  }
}
