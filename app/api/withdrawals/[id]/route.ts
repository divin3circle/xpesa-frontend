import { NextResponse } from "next/server"

import { getCurrentCreatorWithWallet } from "@/lib/payments/withdrawal-server"

/** GET /api/withdrawals/[id] — status for the withdraw UI timeline (owner only). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const creator = await getCurrentCreatorWithWallet()
  if (!creator) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const { supabase, creatorId } = creator
  const { id } = await params

  const { data: withdrawal, error } = await supabase
    .from("withdrawals")
    .select(
      "id, creator_id, status, amount_usdc, amount_kes, mpesa_receipt, wallet_tx_hash, failure_reason"
    )
    .eq("id", id)
    .single()

  if (error || !withdrawal) {
    return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 })
  }
  if (withdrawal.creator_id !== creatorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({
    status: withdrawal.status,
    amountUsdc: withdrawal.amount_usdc,
    amountKes: withdrawal.amount_kes,
    mpesaReceipt: withdrawal.mpesa_receipt,
    walletTxHash: withdrawal.wallet_tx_hash,
    failureReason: withdrawal.failure_reason,
  })
}
