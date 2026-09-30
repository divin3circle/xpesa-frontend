import { NextRequest, NextResponse } from "next/server"

import { envConfig } from "@/lib/env"
import { relayTransferWithAuthorization } from "@/lib/payments/relayer"
import type { TransferAuthorization } from "@/lib/payments/eip3009"
import { getFiatProvider } from "@/lib/payments/providers"
import { getCurrentCreatorWithWallet } from "@/lib/payments/withdrawal-server"
import { validateSignedAuthorization } from "@/lib/payments/withdrawal-authorization"
import {
  withdrawalNetworkToCarrier,
  type WithdrawalChain,
  type WithdrawalNetwork,
} from "@/lib/payments/withdrawal"

// Offramp is KES-only today; the provider status/pay endpoints are per-currency.
const OFFRAMP_CURRENCY = "KES"

/**
 * POST /api/withdrawals/[id]/authorize — accept the creator's signed EIP-3009 authorization,
 * validate it against the stored (trusted) fields, relay it on-chain (creator → the provider's
 * static settlement address; the platform only pays gas), then trigger the provider payout
 * (PUSH) with the resulting tx hash. Non-custodial throughout.
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
        "id, creator_id, status, escrow_address, amount_usdc, amount_kes, authorization_nonce, wallet_tx_hash, chain, network, mpesa_number, offramp_reference"
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

    const chain = (withdrawal.chain as WithdrawalChain) ?? "AVALANCHE"
    const { txHash } = await relayTransferWithAuthorization({
      authorization: body.authorization,
      signature: body.signature,
      chain,
    })

    // Record the broadcast before calling the provider, so a payout failure
    // leaves a recoverable trail (the reconcile cron can retry the payout).
    await supabase
      .from("withdrawals")
      .update({
        status: "onchain_sent",
        wallet_tx_hash: txHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    // PUSH: tell the provider the USDC has landed at its settlement address and
    // to disburse fiat. Reuse our pre-generated reference; adopt the provider's
    // transaction code for status polling.
    const provider = getFiatProvider()
    const payout = await provider.createOfframpPayout({
      reference: String(withdrawal.offramp_reference),
      amountFiat: Number(withdrawal.amount_kes),
      fiatCurrency: OFFRAMP_CURRENCY,
      chain,
      transactionHash: txHash,
      recipient: {
        phone: String(withdrawal.mpesa_number),
        network: withdrawalNetworkToCarrier(
          withdrawal.network as WithdrawalNetwork
        ),
      },
      callbackUrl: envConfig.PRETIUM_WEBHOOK_URL,
    })

    await supabase
      .from("withdrawals")
      .update({
        status: "provider_processing",
        offramp_reference: payout.providerReference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    return NextResponse.json({
      status: "provider_processing",
      txHash,
    })
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
