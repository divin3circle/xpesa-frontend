import { NextRequest, NextResponse } from "next/server"

import { withdrawalRequestSchema } from "@/lib/payments/withdrawal"
import {
  getKotaniOfframpQuote,
  requestKotaniOfframp,
} from "@/lib/payments/kotani-offramp"
import { createKotaniReferenceId } from "@/lib/kotani-pay"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"
import { getCurrentCreatorWithWallet } from "@/lib/payments/withdrawal-server"
import { buildWithdrawalTypedData } from "@/lib/payments/withdrawal-authorization"

/**
 * POST /api/withdrawals — initiate a non-custodial creator offramp.
 * Quote → Kotani offramp (deposit address) → persist → return EIP-3009 typed data to sign.
 * Idempotent on `idempotencyKey`: one withdrawal record + one Kotani request per key.
 */
export async function POST(request: NextRequest) {
  const creator = await getCurrentCreatorWithWallet()
  if (!creator) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const { supabase, creatorId, walletAddress } = creator

  try {
    const input = withdrawalRequestSchema.parse(await request.json())

    const rl = await checkSensitiveRateLimit({
      request,
      scope: "withdrawal",
      identity: walletAddress,
    })
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds)

    const { data: existing } = await supabase
      .from("withdrawals")
      .select("id, status, escrow_address, amount_usdc, amount_kes, rate")
      .eq("idempotency_key", input.idempotencyKey)
      .eq("creator_id", creatorId)
      .maybeSingle()

    if (existing) {
      if (existing.status !== "requested") {
        return NextResponse.json({
          withdrawalId: existing.id,
          status: existing.status,
        })
      }
      // Re-issue a fresh signable authorization for the same withdrawal.
      const { authorization, typedData } = buildWithdrawalTypedData({
        from: walletAddress,
        to: String(existing.escrow_address),
        valueUsdc: Number(existing.amount_usdc),
      })
      await supabase
        .from("withdrawals")
        .update({
          authorization_nonce: authorization.nonce,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
      return NextResponse.json({
        withdrawalId: existing.id,
        depositAddress: existing.escrow_address,
        amountKes: existing.amount_kes,
        rate: existing.rate,
        typedData,
      })
    }

    const quote = await getKotaniOfframpQuote({
      amountUsdc: input.amountUsdc,
      fiatCurrency: input.fiatCurrency,
    })
    const referenceId = createKotaniReferenceId()
    const offramp = await requestKotaniOfframp({
      referenceId,
      amountUsdc: input.amountUsdc,
      fiatCurrency: input.fiatCurrency,
      mpesaNumber: input.mpesaNumber,
      accountName: input.accountName ?? "",
      network: input.network,
    })

    const { authorization, typedData } = buildWithdrawalTypedData({
      from: walletAddress,
      to: offramp.depositAddress,
      valueUsdc: input.amountUsdc,
    })

    const { data: withdrawal, error } = await supabase
      .from("withdrawals")
      .insert({
        creator_id: creatorId,
        amount_usdc: input.amountUsdc,
        amount_kes: quote.amountFiat,
        rate: quote.rate,
        mpesa_number: input.mpesaNumber,
        network: input.network,
        account_name: input.accountName ?? null,
        offramp_reference: offramp.providerReference,
        escrow_address: offramp.depositAddress,
        authorization_nonce: authorization.nonce,
        idempotency_key: input.idempotencyKey,
        status: "requested",
      })
      .select("id")
      .single()

    if (error || !withdrawal) {
      return NextResponse.json(
        { error: error?.message || "Failed to create withdrawal" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      withdrawalId: withdrawal.id,
      depositAddress: offramp.depositAddress,
      amountKes: quote.amountFiat,
      rate: quote.rate,
      typedData,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid withdrawal request",
      },
      { status: 400 }
    )
  }
}
