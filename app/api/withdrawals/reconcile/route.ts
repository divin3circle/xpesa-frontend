import { NextRequest, NextResponse } from "next/server"

import { envConfig } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"
import { getFiatProvider } from "@/lib/payments/providers"
import {
  withdrawalNetworkToCarrier,
  type WithdrawalChain,
  type WithdrawalNetwork,
} from "@/lib/payments/withdrawal"

/**
 * GET /api/withdrawals/reconcile — cron-triggered repair for withdrawals stuck in
 * a non-terminal state. Two cases:
 *  - `onchain_sent`: the USDC was relayed to the provider's settlement address but
 *    the payout call (/v1/pay) never succeeded (authorize crashed after transfer).
 *    Retry the payout with the stored tx hash so the funds are never stranded.
 *  - `provider_processing`: the payout was requested; poll the authoritative status.
 * This is the source of truth for the offramp (Pretium webhooks are unsigned).
 * Guard with CRON_SECRET.
 */
const STUCK_AFTER_MS = 5 * 60 * 1000
const BATCH = 50
const OFFRAMP_CURRENCY = "KES"

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const provider = getFiatProvider()
  const cutoff = new Date(Date.now() - STUCK_AFTER_MS).toISOString()

  const { data: stuck } = await supabase
    .from("withdrawals")
    .select(
      "id, offramp_reference, status, amount_kes, chain, mpesa_number, network, wallet_tx_hash"
    )
    .in("status", ["onchain_sent", "provider_processing"])
    .lt("updated_at", cutoff)
    .limit(BATCH)

  const results: { id: string; status: string }[] = []

  for (const w of stuck ?? []) {
    try {
      // Recovery: funds moved on-chain but the payout was never initiated.
      if (w.status === "onchain_sent") {
        if (!w.wallet_tx_hash || !w.offramp_reference) continue
        // Retry the payout with the SAME reference + tx hash. Idempotency relies
        // on Pretium deduping a payout by its on-chain transaction_hash (one
        // funding transfer -> one payout). TODO(trial): confirm with Pretium.
        const payout = await provider.createOfframpPayout({
          reference: w.offramp_reference,
          amountFiat: Number(w.amount_kes),
          fiatCurrency: OFFRAMP_CURRENCY,
          chain: (w.chain as WithdrawalChain) ?? "AVALANCHE",
          transactionHash: w.wallet_tx_hash,
          recipient: {
            phone: String(w.mpesa_number),
            network: withdrawalNetworkToCarrier(w.network as WithdrawalNetwork),
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
          .eq("id", w.id)
        results.push({ id: w.id, status: "payout_retried" })
        continue
      }

      // provider_processing: poll the authoritative status.
      if (!w.offramp_reference) continue
      const s = await provider.getTransactionStatus({
        reference: w.offramp_reference,
        fiatCurrency: OFFRAMP_CURRENCY,
      })
      // Still in flight — leave for the next cycle.
      if (s.state !== "complete" && s.state !== "failed") continue

      const outcome = s.state === "complete" ? "paid" : "failed"
      const now = new Date().toISOString()
      const update: Record<string, unknown> = { status: outcome, updated_at: now }
      if (outcome === "paid") {
        update.mpesa_receipt = s.mpesaReceipt
        update.completed_at = now
      }
      await supabase.from("withdrawals").update(update).eq("id", w.id)
      results.push({ id: w.id, status: outcome })
    } catch {
      // Leave it for the next cycle.
    }
  }

  return NextResponse.json({ reconciled: results.length, results })
}
