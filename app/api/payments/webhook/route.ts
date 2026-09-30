import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getFiatProvider } from "@/lib/payments/providers"
import { reconcileFiatOnramp } from "@/lib/payments/settlement"
import { auditSecurityEvent } from "@/lib/security/audit"

/**
 * Provider-neutral fiat onramp webhook. The webhook is treated purely as a HINT:
 * it tells us an intent changed, but reconcileFiatOnramp re-checks the provider's
 * authoritative status API before any USDC moves (Pretium does not sign webhooks).
 */
export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const provider = getFiatProvider()
  const payload = await request.json().catch(() => ({}))
  // TODO(trial): remove once Pretium webhook shape is confirmed.
  console.log("[PRETIUM_TRIAL] webhook", JSON.stringify(payload))

  const verification = provider.verifyWebhookSignature({
    payload,
    headerSignature:
      request.headers.get("x-webhook-signature") ??
      request.headers.get("x-pretium-signature"),
  })
  if (!verification.ok) {
    auditSecurityEvent("warn", "fiat_webhook_rejected", {
      provider: provider.id,
      reason: verification.reason,
    })
    return NextResponse.json({ error: verification.reason }, { status: 401 })
  }

  const event = provider.parseWebhookEvent(payload)
  if (!event.providerReference) {
    return NextResponse.json({ ok: true, matched: false })
  }

  const eventId = event.providerEventId || event.providerReference

  // Dedupe on (provider, provider_event_id).
  const { data: existingEvent } = await supabase
    .from("payment_events")
    .select("id")
    .eq("provider", provider.id)
    .eq("provider_event_id", eventId)
    .maybeSingle()

  if (existingEvent) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  const { data: intent } = await supabase
    .from("payment_intents")
    .select("id")
    .eq("provider_reference", event.providerReference)
    .maybeSingle()

  const { data: insertedEvent, error: eventError } = await supabase
    .from("payment_events")
    .insert({
      payment_intent_id: intent?.id ?? null,
      provider: provider.id,
      provider_event_id: eventId,
      event_type: event.rawStatus || "status.updated",
      payload: event.payload,
      processing_status: "received",
    })
    .select()
    .single()

  if (eventError || !insertedEvent) {
    return NextResponse.json(
      { error: eventError?.message || "Failed to record webhook event" },
      { status: 500 }
    )
  }

  if (!intent) {
    await supabase
      .from("payment_events")
      .update({
        processing_status: "unmatched",
        processed_at: new Date().toISOString(),
      })
      .eq("id", insertedEvent.id)
    return NextResponse.json({ ok: true, matched: false })
  }

  try {
    const result = await reconcileFiatOnramp({
      supabase,
      paymentIntentId: intent.id,
      requestHeaders: request.headers,
    })

    await supabase
      .from("payment_events")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", insertedEvent.id)

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    await supabase
      .from("payment_events")
      .update({
        processing_status: "failed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", insertedEvent.id)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process webhook",
      },
      { status: 500 }
    )
  }
}
