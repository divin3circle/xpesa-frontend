import { NextRequest, NextResponse } from "next/server"

import {
  validateOfframpAmount,
  withdrawalRequestSchema,
  type WithdrawalChain,
} from "@/lib/payments/withdrawal"
import { getFiatProvider } from "@/lib/payments/providers"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"
import { getCurrentCreatorWithWallet } from "@/lib/payments/withdrawal-server"
import { buildWithdrawalTypedData } from "@/lib/payments/withdrawal-authorization"
import { randomUUID } from "crypto"

/**
 * POST /api/withdrawals — initiate a non-custodial creator offramp.
 * Quote → provider settlement address (static) → persist → return EIP-3009 typed
 * data to sign. The creator later signs; we relay the transfer on-chain and then
 * call the provider's payout API with the tx hash (PUSH model).
 * Idempotent on `idempotencyKey`: one withdrawal record per key.
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

    const provider = getFiatProvider()

    const { data: existing } = await supabase
      .from("withdrawals")
      .select("id, status, escrow_address, amount_usdc, amount_kes, rate, chain")
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
        chain: (existing.chain as WithdrawalChain) ?? "AVALANCHE",
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

    const quote = await provider.getOfframpQuote({
      amountUsdc: input.amountUsdc,
      fiatCurrency: input.fiatCurrency,
    })

    // Enforce min/max BEFORE issuing anything to sign — never relay funds
    // on-chain for a payout the provider would reject (push-model strands funds).
    const amountError = validateOfframpAmount({
      amountUsdc: input.amountUsdc,
      amountFiat: quote.amountFiat,
      fiatCurrency: input.fiatCurrency,
    })
    if (amountError) {
      return NextResponse.json(
        { error: amountError, code: "OFFRAMP_AMOUNT_REJECTED" },
        { status: 422 }
      )
    }

    // PUSH model: the creator sends USDC to the provider's static settlement
    // address; we generate the payout reference up-front and hand it to the
    // provider's /pay call after the on-chain transfer (in the authorize route).
    const settlementAddress = await provider.getOfframpSettlementAddress(
      input.chain
    )
    const offrampReference = randomUUID()

    const { authorization, typedData } = buildWithdrawalTypedData({
      from: walletAddress,
      to: settlementAddress,
      valueUsdc: input.amountUsdc,
      chain: input.chain,
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
        offramp_reference: offrampReference,
        escrow_address: settlementAddress,
        chain: input.chain,
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
      depositAddress: settlementAddress,
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
