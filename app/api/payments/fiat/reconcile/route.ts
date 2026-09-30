import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { reconcileFiatOnramp } from "@/lib/payments/settlement"

/**
 * GET /api/payments/fiat/reconcile — cron-triggered batch repair for onramp
 * intents stuck in a non-terminal state (a missed/late webhook). Each is
 * reconciled against the provider's authoritative status and settled if the
 * fiat collection is complete. Idempotent with the webhook path. Guard with
 * CRON_SECRET (Vercel sends it as the Bearer token on cron invocations).
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
    .from("payment_intents")
    .select("id, status")
    .in("status", ["provider_pending", "settling"])
    .lt("updated_at", cutoff)
    .limit(BATCH)

  const results: { id: string; status: string }[] = []

  for (const intent of stuck ?? []) {
    try {
      const result = await reconcileFiatOnramp({
        supabase,
        paymentIntentId: intent.id,
        requestHeaders: request.headers,
      })
      if (result.status !== "pending") {
        results.push({ id: intent.id, status: result.status })
      }
    } catch {
      // Leave it for the next cycle.
    }
  }

  return NextResponse.json({ reconciled: results.length, results })
}
