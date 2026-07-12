import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  parseKotaniWebhook,
  settleFiatPaymentIntent,
  verifyKotaniWebhookSignature,
} from "@/lib/payments/kotani"

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const payload = await request.json().catch(() => ({}))
  const signature = verifyKotaniWebhookSignature({
    payload,
    headerSignature: request.headers.get("x-kotani-signature"),
  })

  if (!signature.ok) {
    return NextResponse.json({ error: signature.reason }, { status: 401 })
  }

  const event = parseKotaniWebhook(payload)

  const { data: existingEvent } = await supabase
    .from("payment_events")
    .select("id")
    .eq("provider", "kotani")
    .eq("provider_event_id", event.providerEventId)
    .maybeSingle()

  if (existingEvent) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  let intentId = event.paymentIntentId
  if (!intentId && event.providerReference) {
    const { data: intent } = await supabase
      .from("payment_intents")
      .select("id")
      .eq("provider_reference", event.providerReference)
      .maybeSingle()
    intentId = intent?.id ?? null
  }

  const { data: insertedEvent, error: eventError } = await supabase
    .from("payment_events")
    .insert({
      payment_intent_id: intentId,
      provider: "kotani",
      provider_event_id: event.providerEventId,
      event_type: event.eventType,
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

  if (!intentId) {
    await supabase
      .from("payment_events")
      .update({
        processing_status: "unmatched",
        processed_at: new Date().toISOString(),
      })
      .eq("id", insertedEvent.id)
    return NextResponse.json({ ok: true, matched: false })
  }

  if (event.status) {
    await supabase
      .from("payment_intents")
      .update({
        status: event.status,
        settled_usdc: event.settledUsdc,
        failure_code: event.failureCode,
        failure_message: event.failureMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", intentId)
  }

  try {
    let access = null
    if (event.status === "settling") {
      access = await settleFiatPaymentIntent({
        supabase,
        paymentIntentId: intentId,
        requestHeaders: request.headers,
      })
    }

    await supabase
      .from("payment_events")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", insertedEvent.id)

    return NextResponse.json({ ok: true, access })
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
