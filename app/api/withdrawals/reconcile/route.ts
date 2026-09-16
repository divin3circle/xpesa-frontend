import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  getKotaniOfframpStatus,
  mapKotaniOfframpStatus,
} from "@/lib/payments/kotani-offramp"

/**
 * GET /api/withdrawals/reconcile — cron-triggered repair for withdrawals stuck in a non-terminal
 * state (a missed/late webhook). Polls Kotani for the true status and advances the record. This
 * is the source of truth; the webhook is an optimization. Guard with CRON_SECRET when set.
 */
const STUCK_AFTER_MS = 5 * 60 * 1000
const BATCH = 50

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

  const results: { id: string; status: string }[] = []

  for (const w of stuck ?? []) {
    if (!w.offramp_reference) continue
    try {
      const s = await getKotaniOfframpStatus(w.offramp_reference)
      const outcome = mapKotaniOfframpStatus(s.status)
      if (outcome === "provider_processing") continue

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
