import { NextRequest, NextResponse } from "next/server"

import { envConfig } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  calculateFiatPaymentAmounts,
  fiatPaymentIntentRequestSchema,
} from "@/lib/payments/fiat"
import { getFiatProvider } from "@/lib/payments/providers"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"
import { randomUUID } from "crypto"

// Pretium onramp delivers stablecoin on Base or Celo (not Avalanche yet); we
// settle fans' fiat purchases as USDC on Base. The offramp is what lets a
// creator later choose Base or Avalanche.
const ONRAMP_CHAIN = "BASE"
const ONRAMP_ASSET = "USDC"

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  try {
    const input = fiatPaymentIntentRequestSchema.parse(await request.json())
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "payment_intent",
      identity: input.buyerPhone ?? input.linkId,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    if (!envConfig.PLATFORM_WALLET_ADDRESS) {
      return NextResponse.json(
        { error: "Platform wallet is not configured" },
        { status: 500 }
      )
    }

    const { data: link, error: linkError } = await supabase
      .from("links")
      .select("id, creator_id, price_usdc, suggested_amount_usdc, type, creator:creators(wallet_address)")
      .eq("id", input.linkId)
      .eq("is_active", true)
      .eq("moderation_status", "approved")
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    const expectedAmount = Number(link.suggested_amount_usdc ?? link.price_usdc ?? 0)
    if (expectedAmount > 0 && Math.abs(expectedAmount - input.amountUsdc) > 0.000001) {
      return NextResponse.json(
        { error: "Payment amount does not match this link" },
        { status: 422 }
      )
    }

    const creator = Array.isArray(link.creator) ? link.creator[0] : link.creator
    const creatorWalletAddress = creator?.wallet_address
    if (!creatorWalletAddress) {
      return NextResponse.json(
        { error: "Creator wallet is not configured" },
        { status: 500 }
      )
    }

    const provider = getFiatProvider()

    // Mobile money needs a phone to push the STK prompt to — never let it through
    // without one (previously this was optional and reached the provider empty).
    if (input.method === "mobile_money" && !input.buyerPhone) {
      return NextResponse.json(
        { error: "A mobile-money phone number is required" },
        { status: 422 }
      )
    }

    // Recompute the fiat amount from a fresh server-side quote. NEVER trust the
    // client-supplied input.amountFiat — the client only controls how much USDC
    // it wants; the KES it must pay is ours to compute from the live rate.
    const quote = await provider.getOnrampQuote({
      amountUsdc: input.amountUsdc,
      fiatCurrency: input.fiatCurrency,
    })

    const amounts = calculateFiatPaymentAmounts(input.amountUsdc)
    const providerReference = randomUUID()

    const { data: intent, error: intentError } = await supabase
      .from("payment_intents")
      .insert({
        link_id: input.linkId,
        creator_id: link.creator_id,
        method: input.method,
        provider: provider.id,
        status: "created",
        amount_fiat: quote.amountFiat,
        fiat_currency: input.fiatCurrency,
        quoted_usdc: amounts.amountUsdc,
        platform_fee_usdc: amounts.platformFeeUsdc,
        creator_net_usdc: amounts.creatorNetUsdc,
        creator_wallet_address: creatorWalletAddress,
        platform_wallet_address: envConfig.PLATFORM_WALLET_ADDRESS,
        buyer_phone: input.buyerPhone ?? null,
        buyer_country: input.buyerCountry,
        buyer_network: input.buyerNetwork ?? null,
        bank_name: input.bankName ?? null,
        bank_account_ref: input.bankAccountRef ?? null,
        provider_reference: providerReference,
      })
      .select()
      .single()

    if (intentError || !intent) {
      return NextResponse.json(
        { error: intentError?.message || "Failed to create payment intent" },
        { status: 500 }
      )
    }

    try {
      const collection = await provider.createOnrampOrder({
        reference: providerReference,
        amountFiat: quote.amountFiat,
        fiatCurrency: input.fiatCurrency,
        receiverAddress: envConfig.PLATFORM_WALLET_ADDRESS,
        chain: ONRAMP_CHAIN,
        asset: ONRAMP_ASSET,
        buyer: {
          phone: input.buyerPhone ?? "",
          network: input.buyerNetwork ?? "Safaricom",
        },
        callbackUrl: process.env.PRETIUM_WEBHOOK_URL ?? "",
      })

      const { data: updatedIntent, error: updateError } = await supabase
        .from("payment_intents")
        .update({
          status: "provider_pending",
          provider_reference: collection.providerReference,
          provider_checkout_id: collection.providerCheckoutId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", intent.id)
        .select()
        .single()

      if (updateError || !updatedIntent) {
        throw new Error(updateError?.message || "Failed to update intent")
      }

      return NextResponse.json({
        intent: updatedIntent,
        provider: collection.raw,
      })
    } catch (error) {
      await supabase
        .from("payment_intents")
        .update({
          status: "failed",
          failure_code: "ONRAMP_COLLECTION_FAILED",
          failure_message:
            error instanceof Error ? error.message : "Onramp collection failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", intent.id)

      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Onramp collection failed",
        },
        { status: 502 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid payment intent request",
      },
      { status: 400 }
    )
  }
}
