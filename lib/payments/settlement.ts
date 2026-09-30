import { ethers } from "ethers"

import { envConfig } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"
import { createAccessForConfirmedPayment } from "@/lib/payments/access"
import { calculateFiatPaymentAmounts } from "@/lib/payments/fiat"
import { getChainConfig, type PaymentChain } from "@/lib/payments/chains"
import { getFiatProvider } from "@/lib/payments/providers"

/**
 * Provider-neutral, chain-aware settlement for the fiat ONRAMP
 * (fan pays fiat -> platform delivers the creator's USDC on-chain).
 *
 * Replaces the Kotani-specific settleFiatPaymentIntent. Two invariants matter
 * for money safety:
 *  1. Never move USDC off a webhook alone — Pretium webhooks are unsigned, so we
 *     always re-check the provider's authoritative status API first.
 *  2. Never pay out more than the fan quoted — the on-chain amount is derived
 *     from quoted_usdc (capped), never from a provider-reported figure.
 */

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
] as const

/** Pretium onramp delivers on Base/Celo (not Avalanche yet); we settle on Base. */
export const ONRAMP_SETTLEMENT_CHAIN: PaymentChain = "BASE"

export type ReconcileResult =
  | {
      status: "settled"
      access: { accessToken: string; transactionId: string }
    }
  | { status: "pending" }
  | { status: "failed"; reason: string }

/**
 * Reconcile a fiat onramp intent against the provider's authoritative status,
 * and settle on-chain only when the fiat collection is genuinely complete.
 * Idempotent: safe to call from the webhook and the reconcile cron concurrently.
 */
export async function reconcileFiatOnramp({
  supabase,
  paymentIntentId,
  requestHeaders,
  chain = ONRAMP_SETTLEMENT_CHAIN,
}: {
  supabase: SupabaseAdminClient
  paymentIntentId: string
  requestHeaders: Headers
  chain?: PaymentChain
}): Promise<ReconcileResult> {
  const provider = getFiatProvider()

  const { data: intent, error: intentError } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("id", paymentIntentId)
    .single()

  if (intentError || !intent) {
    throw new Error(intentError?.message || "Payment intent not found")
  }

  if (intent.status === "access_issued") {
    return {
      status: "settled",
      access: {
        accessToken: intent.access_token_id as string,
        transactionId: intent.transaction_id as string,
      },
    }
  }

  if (!intent.provider_reference) {
    throw new Error("Payment intent has no provider reference to reconcile")
  }

  // Authoritative check — webhooks are only hints.
  const status = await provider.getTransactionStatus({
    reference: String(intent.provider_reference),
    fiatCurrency: String(intent.fiat_currency),
  })

  if (status.state === "failed") {
    await supabase
      .from("payment_intents")
      .update({
        status: "failed",
        failure_code: "PROVIDER_REPORTED_FAILED",
        failure_message: "Provider reported the fiat collection failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentIntentId)
    return { status: "failed", reason: "provider_failed" }
  }

  if (status.state !== "complete") {
    // pending / processing / unknown — nothing to settle yet.
    return { status: "pending" }
  }

  const access = await settleOnChain({ supabase, intent, requestHeaders, chain })
  return { status: "settled", access }
}

async function settleOnChain({
  supabase,
  intent,
  requestHeaders,
  chain,
}: {
  supabase: SupabaseAdminClient
  intent: Record<string, unknown>
  requestHeaders: Headers
  chain: PaymentChain
}): Promise<{ accessToken: string; transactionId: string }> {
  if (!envConfig.PLATFORM_WALLET_PRIVATE_KEY) {
    throw new Error("Platform wallet signer is not configured")
  }

  const intentId = String(intent.id)

  // Authoritative USDC amount = what the fan quoted. Cap at quoted so a provider
  // figure can never inflate the payout.
  const quotedUsdc = Number(intent.quoted_usdc)
  const settledUsdc =
    intent.settled_usdc != null ? Number(intent.settled_usdc) : quotedUsdc
  const amountUsdc = Math.min(settledUsdc, quotedUsdc)
  const amounts = calculateFiatPaymentAmounts(amountUsdc)
  const creatorWalletAddress = String(intent.creator_wallet_address)
  const platformWalletAddress = String(intent.platform_wallet_address)
  const chainConfig = getChainConfig(chain)

  // Idempotency: at most one active settlement transfer per intent. Also backed
  // by a partial unique index on settlement_transfers.payment_intent_id so two
  // concurrent callers can never both send the on-chain transfer.
  const { data: existingTransfer } = await supabase
    .from("settlement_transfers")
    .select("id, status, tx_hash")
    .eq("payment_intent_id", intentId)
    .in("status", ["pending", "submitted", "confirmed"])
    .maybeSingle()

  let payoutTxHash: string | null = existingTransfer?.tx_hash ?? null
  let gasCostNative: number | null = null

  if (!existingTransfer) {
    const { data: transfer, error: transferError } = await supabase
      .from("settlement_transfers")
      .insert({
        payment_intent_id: intentId,
        from_wallet: platformWalletAddress,
        to_wallet: creatorWalletAddress,
        amount_usdc: amounts.creatorNetUsdc,
        status: "pending",
        attempt_count: 1,
      })
      .select()
      .single()

    if (transferError || !transfer) {
      // A unique-violation here means a concurrent settle already started —
      // abort rather than risk a double payout.
      throw new Error(
        transferError?.message || "Failed to create settlement transfer"
      )
    }

    await supabase
      .from("payment_intents")
      .update({
        status: "settling",
        platform_fee_usdc: amounts.platformFeeUsdc,
        creator_net_usdc: amounts.creatorNetUsdc,
        updated_at: new Date().toISOString(),
      })
      .eq("id", intentId)

    try {
      const rpc = new ethers.JsonRpcProvider(chainConfig.rpcUrl)
      const wallet = new ethers.Wallet(
        envConfig.PLATFORM_WALLET_PRIVATE_KEY,
        rpc
      )
      const usdc = new ethers.Contract(
        chainConfig.usdcAddress,
        ERC20_ABI,
        wallet
      )
      const tx = await usdc.transfer(
        creatorWalletAddress,
        ethers.parseUnits(amounts.creatorNetUsdc.toFixed(6), 6)
      )
      payoutTxHash = tx.hash

      await supabase
        .from("settlement_transfers")
        .update({ status: "submitted", tx_hash: payoutTxHash })
        .eq("id", transfer.id)

      const receipt = await tx.wait(1)
      if (receipt) {
        gasCostNative = Number(
          ethers.formatEther(receipt.gasUsed * receipt.gasPrice)
        )
      }

      await supabase
        .from("settlement_transfers")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", transfer.id)
    } catch (error) {
      await supabase
        .from("settlement_transfers")
        .update({
          status: "failed",
          last_error:
            error instanceof Error ? error.message : "Unknown settlement error",
        })
        .eq("id", transfer.id)
      throw error
    }
  }

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select(
      "id, creator_id, type, access_expiry_type, access_ip_binding, access_max_views"
    )
    .eq("id", intent.link_id)
    .single()

  if (linkError || !link) {
    throw new Error(linkError?.message || "Link not found")
  }

  const access = await createAccessForConfirmedPayment({
    supabase,
    link,
    fanWalletAddress: `fiat:${intentId}`,
    txHash: payoutTxHash,
    // On Base the native gas is ETH; the column is historically named *_avax but
    // stores native gas cost for whichever chain settled.
    network: chainConfig.chain.toLowerCase(),
    amountUsdc: amounts.amountUsdc,
    platformFeeUsdc: amounts.platformFeeUsdc,
    creatorNetUsdc: amounts.creatorNetUsdc,
    requestHeaders,
    paymentIntentId: intentId,
    paymentMethod: intent.method as string | null,
    gasCostAvax: gasCostNative,
  })

  await supabase
    .from("payment_intents")
    .update({
      status: "access_issued",
      access_token_id: access.accessToken,
      transaction_id: access.transactionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", intentId)

  return access
}
