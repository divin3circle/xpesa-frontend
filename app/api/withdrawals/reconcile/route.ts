import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getFiatProvider } from "@/lib/payments/providers"

/**
 * GET /api/withdrawals/reconcile — cron-triggered repair for withdrawals stuck in a non-terminal
 * state. Polls the provider's authoritative status API and advances the record. This is the
 * source of truth for the offramp (Pretium webhooks are unsigned). Guard with CRON_SECRET.
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
  const cutoff = new Date(Date.now() - STUCK_AFTER_MS).toISOString()

  const { data: stuck } = await supabase
    .from("withdrawals")
    .select("id, offramp_reference, status")
    .in("status", ["onchain_sent", "provider_processing"])
    .lt("updated_at", cutoff)
    .limit(BATCH)

  const provider = getFiatProvider()
  const results: { id: string; status: string }[] = []

  for (const w of stuck ?? []) {
    if (!w.offramp_reference) continue
    try {
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
