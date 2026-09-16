import { NextRequest, NextResponse } from "next/server"

import { relayTransferWithAuthorization } from "@/lib/payments/relayer"
import type { TransferAuthorization } from "@/lib/payments/eip3009"
import { getCurrentCreatorWithWallet } from "@/lib/payments/withdrawal-server"
import { validateSignedAuthorization } from "@/lib/payments/withdrawal-authorization"

/**
 * POST /api/withdrawals/[id]/authorize — accept the creator's signed EIP-3009 authorization,
 * validate it against the stored (trusted) fields, then relay it on-chain. Non-custodial:
 * the USDC moves creator → Kotani deposit address; the platform only pays gas.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const creator = await getCurrentCreatorWithWallet()
  if (!creator) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const { supabase, creatorId, walletAddress } = creator
  const { id } = await params

  try {
    const body = (await request.json()) as {
      authorization?: TransferAuthorization
      signature?: string
    }
    if (!body?.authorization || !body?.signature) {
      return NextResponse.json(
        { error: "Missing authorization or signature" },
        { status: 400 }
      )
    }

    const { data: withdrawal, error } = await supabase
      .from("withdrawals")
      .select(
        "id, creator_id, status, escrow_address, amount_usdc, authorization_nonce, wallet_tx_hash"
      )
      .eq("id", id)
      .single()

    if (error || !withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 })
    }
    if (withdrawal.creator_id !== creatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (
      ["onchain_sent", "provider_processing", "paid"].includes(withdrawal.status)
    ) {
      // Idempotent: already broadcast.
      return NextResponse.json({
        status: withdrawal.status,
        txHash: withdrawal.wallet_tx_hash,
      })
    }
    if (withdrawal.status !== "requested") {
      return NextResponse.json(
        { error: `Withdrawal is ${withdrawal.status}` },
        { status: 409 }
      )
    }

    const validationError = validateSignedAuthorization(body.authorization, {
      from: walletAddress,
      to: String(withdrawal.escrow_address),
      valueUsdc: Number(withdrawal.amount_usdc),
      nonce: String(withdrawal.authorization_nonce),
    })
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 422 })
    }

    const { txHash } = await relayTransferWithAuthorization({
      authorization: body.authorization,
      signature: body.signature,
    })

    await supabase
      .from("withdrawals")
      .update({
        status: "onchain_sent",
        wallet_tx_hash: txHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    return NextResponse.json({ status: "onchain_sent", txHash })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to authorize withdrawal",
      },
      { status: 500 }
    )
  }
}
