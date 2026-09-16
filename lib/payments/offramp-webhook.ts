import { createAdminClient } from "@/lib/supabase/admin"
import { mapKotaniOfframpStatus } from "@/lib/payments/kotani-offramp"
import { readString } from "@/lib/payments/kotani-client"
import type { KotaniWebhookEvent } from "@/lib/payments/kotani"

/**
 * Handle a Kotani webhook event for the creator OFFRAMP path (crypto → fiat), distinct from the
 * onramp/collection settlement in the main webhook route. Matches the event to a `withdrawals`
 * row by `offramp_reference`, dedupes via `withdrawal_events`, and advances the withdrawal to a
 * terminal outcome (paid / failed / refunded). Returns `matched: false` for non-offramp events
 * so the caller can fall through to the onramp handler.
 */

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

export async function handleOfframpWebhookEvent({
  supabase,
  event,
}: {
  supabase: SupabaseAdminClient
  event: KotaniWebhookEvent
}): Promise<{ matched: boolean; status?: string }> {
  if (!event.providerReference) return { matched: false }

  const { data: withdrawal } = await supabase
    .from("withdrawals")
    .select("id, status")
    .eq("offramp_reference", event.providerReference)
    .maybeSingle()

  if (!withdrawal) return { matched: false }

  // Idempotent: ignore an event we've already recorded.
  const { data: duplicate } = await supabase
    .from("withdrawal_events")
    .select("id")
    .eq("provider", "kotani")
    .eq("provider_event_id", event.providerEventId)
    .maybeSingle()
  if (duplicate) return { matched: true, status: withdrawal.status }

  const outcome = mapKotaniOfframpStatus(event.eventType)
  const data = (event.payload?.data ?? event.payload) as Record<string, unknown>
  const mpesaReceipt = readString(data, [
    "mpesaReceipt",
    "receipt",
    "providerReceipt",
    "mpesa_receipt",
  ])

  await supabase.from("withdrawal_events").insert({
    withdrawal_id: withdrawal.id,
    provider: "kotani",
    provider_event_id: event.providerEventId,
    event_type: event.eventType,
    payload: event.payload,
    processing_status: "processed",
    processed_at: new Date().toISOString(),
  })

  const isTerminal = ["paid", "failed", "refunded"].includes(withdrawal.status)
  if (!isTerminal && outcome !== "provider_processing") {
    const now = new Date().toISOString()
    const update: Record<string, unknown> = { status: outcome, updated_at: now }
    if (outcome === "paid") {
      update.mpesa_receipt = mpesaReceipt
      update.completed_at = now
    }
    if (outcome === "failed") {
      // USDC already left the creator's wallet -> flag for manual refund review.
      update.failure_reason = event.failureMessage ?? event.eventType
    }
    await supabase.from("withdrawals").update(update).eq("id", withdrawal.id)
  }

  return { matched: true, status: outcome }
}
