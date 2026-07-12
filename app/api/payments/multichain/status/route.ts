import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  assertCompletedAvalancheSettlement,
  getBridgeStatus,
  getDestinationTxHash,
} from "@/lib/payments/multichain/status"
import { multichainStatusRequestSchema } from "@/lib/payments/multichain/schema"

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  try {
    const input = multichainStatusRequestSchema.parse(await request.json())
    const { data: intent, error } = await supabase
      .from("bridge_payment_intents")
      .select("*")
      .eq("id", input.intentId)
      .single()

    if (error || !intent) throw new Error("Bridge intent not found")

    const status = await getBridgeStatus({
      originTxHash: input.originTxHash as `0x${string}`,
      originChainId: input.originChainId,
      transactionId: input.transactionId,
    })
    const destinationTxHash = getDestinationTxHash(status)
    const isComplete = assertCompletedAvalancheSettlement(
      status,
      String(intent.destination_amount_wei)
    )

    await supabase
      .from("bridge_payment_intents")
      .update({
        status: isComplete ? "settled" : "bridge_pending",
        origin_tx_hash: input.originTxHash,
        destination_tx_hash: destinationTxHash,
        bridge_status: status.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", intent.id)

    return NextResponse.json({
      status: status.status,
      isComplete,
      destinationTxHash,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Status check failed" },
      { status: 400 }
    )
  }
}
