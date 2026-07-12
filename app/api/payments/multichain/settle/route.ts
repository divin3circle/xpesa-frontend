import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getValidPaidLink } from "@/lib/payments/multichain/link"
import { settleMultichainPayment } from "@/lib/payments/multichain/settlement"
import { multichainSettleRequestSchema } from "@/lib/payments/multichain/schema"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  let intentId = ""

  try {
    const input = multichainSettleRequestSchema.parse(await request.json())
    intentId = input.intentId
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "payment_multichain",
      identity: input.intentId,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const { data: intent, error } = await supabase
      .from("bridge_payment_intents")
      .select("*")
      .eq("id", input.intentId)
      .single()

    if (error || !intent) throw new Error("Bridge intent not found")
    if (intent.status !== "settled" && intent.status !== "access_issued") {
      throw new Error("Bridge settlement is not complete")
    }

    const link = await getValidPaidLink({
      supabase,
      linkId: intent.link_id,
      amountUsdc: Number(intent.amount_usdc),
    })
    const access = await settleMultichainPayment({
      supabase,
      intent,
      link,
      requestHeaders: request.headers,
    })

    return NextResponse.json(access)
  } catch (error) {
    await supabase
      .from("bridge_payment_intents")
      .update({
        status: "settlement_failed",
        failure_message:
          error instanceof Error ? error.message : "Settlement failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", intentId)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Settlement failed" },
      { status: 400 }
    )
  }
}
