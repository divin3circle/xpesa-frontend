import { ethers } from "ethers"
import crypto from "crypto"

import { envConfig } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"
import { USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"
import { KOTANI_FALLBACK_RATES, createKotaniReferenceId } from "@/lib/kotani-pay"
import {
  FiatPaymentIntentRequest,
  calculateFiatPaymentAmounts,
  getFiatPaymentStatusMessage,
  roundUsdc,
  type FiatPaymentStatus,
} from "@/lib/payments/fiat"
import { createAccessForConfirmedPayment } from "@/lib/payments/access"

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
] as const

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

export type KotaniCollectionResult = {
  providerReference: string
  providerCheckoutId: string | null
  raw: unknown
}

export type KotaniWebhookEvent = {
  providerEventId: string
  eventType: string
  providerReference: string | null
  paymentIntentId: string | null
  status: FiatPaymentStatus | null
  settledUsdc: number | null
  providerTxHash: string | null
  failureCode: string | null
  failureMessage: string | null
  payload: Record<string, unknown>
}

export type KotaniWebhookSignatureResult =
  | { ok: true }
  | { ok: false; reason: string }

function signKotaniRequest({
  method,
  body,
  url,
}: {
  method: string
  body?: string
  url?: string
}) {
  if (!envConfig.KOTANI_SECRET) return {}

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomUUID()
  const lastPathSegment = url
    ? new URL(url).pathname.split("/").filter(Boolean).at(-1) || ""
    : ""
  const signingBody = method.toUpperCase() === "GET" ? lastPathSegment : body || "{}"
  const payload = `${timestamp}.${nonce}.${signingBody}`
  const signature = crypto
    .createHmac("sha256", envConfig.KOTANI_SECRET)
    .update(payload, "utf8")
    .digest("hex")

  return {
    "x-timestamp": timestamp,
    "x-nonce": nonce,
    "x-signature": signature,
  }
}

function kotaniHeaders({
  method = "GET",
  body,
  url,
}: {
  method?: string
  body?: string
  url?: string
} = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (envConfig.KOTANI_KEY) {
    headers.Authorization = `Bearer ${envConfig.KOTANI_KEY}`
  }
  Object.assign(headers, signKotaniRequest({ method, body, url }))
  return headers
}

function readString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return null
}

function readNumber(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key]
    const numeric = typeof value === "number" ? value : Number(value)
    if (Number.isFinite(numeric) && numeric > 0) return numeric
  }
  return null
}

function readNestedString(payload: Record<string, unknown>, paths: string[][]) {
  for (const path of paths) {
    let value: unknown = payload
    for (const key of path) {
      if (!value || typeof value !== "object") {
        value = null
        break
      }
      value = (value as Record<string, unknown>)[key]
    }
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return null
}

function normalizeProviderNetwork(network: string | undefined) {
  const normalized = network?.trim().toUpperCase()
  if (!normalized || normalized === "MPESA" || normalized === "M-PESA") {
    return "MPESA"
  }
  return normalized
}

function unwrapKotaniData(body: unknown) {
  if (!body || typeof body !== "object") return {}
  const record = body as Record<string, unknown>
  return record.data && typeof record.data === "object"
    ? (record.data as Record<string, unknown>)
    : record
}

function isSignedKotaniEnvelope(payload: unknown): payload is {
  event: string
  data: Record<string, unknown>
  signature?: string
} {
  if (!payload || typeof payload !== "object") return false
  const record = payload as Record<string, unknown>
  return (
    typeof record.event === "string" &&
    record.data !== null &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
  )
}

export function verifyKotaniWebhookSignature({
  payload,
  headerSignature,
  secret = envConfig.KOTANI_WEBHOOK_SECRET,
}: {
  payload: unknown
  headerSignature: string | null
  secret?: string
}): KotaniWebhookSignatureResult {
  if (!secret) return { ok: true }
  if (!headerSignature) {
    return { ok: false, reason: "Missing Kotani webhook signature" }
  }
  if (!isSignedKotaniEnvelope(payload)) {
    return { ok: false, reason: "Invalid signed Kotani webhook envelope" }
  }

  const payloadWithoutSignature = {
    event: payload.event,
    data: payload.data,
  }
  const computed =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payloadWithoutSignature))
      .digest("hex")

  try {
    const computedBuffer = Buffer.from(computed)
    const headerBuffer = Buffer.from(headerSignature.trim())
    if (computedBuffer.length !== headerBuffer.length) {
      return { ok: false, reason: "Invalid Kotani webhook signature" }
    }
    return crypto.timingSafeEqual(computedBuffer, headerBuffer)
      ? { ok: true }
      : { ok: false, reason: "Invalid Kotani webhook signature" }
  } catch {
    return { ok: false, reason: "Invalid Kotani webhook signature" }
  }
}

export function extractKotaniRate(body: unknown, currency: string) {
  const fallback =
    KOTANI_FALLBACK_RATES[currency as keyof typeof KOTANI_FALLBACK_RATES] ??
    null

  if (!body || typeof body !== "object") return fallback
  const payload = body as Record<string, unknown>
  const directRate = readNumber(payload, [
    "rate",
    "exchangeRate",
    "conversionRate",
    "value",
  ])
  if (directRate) return directRate

  const data = payload.data
  if (Array.isArray(data)) {
    const match = data.find((item) => {
      if (!item || typeof item !== "object") return false
      const record = item as Record<string, unknown>
      return (
        record.destination === currency ||
        record.destinationCurrency === currency ||
        record.currency === currency
      )
    }) as Record<string, unknown> | undefined
    if (match) {
      return (
        readNumber(match, ["rate", "exchangeRate", "conversionRate", "value"]) ??
        fallback
      )
    }
  }

  if (data && typeof data === "object") {
    return (
      readNumber(data as Record<string, unknown>, [
        "rate",
        "exchangeRate",
        "conversionRate",
        "value",
      ]) ?? fallback
    )
  }

  return fallback
}

export async function getKotaniFiatQuote({
  amountUsdc,
  fiatCurrency,
}: {
  amountUsdc: number
  fiatCurrency: string
}) {
  let body: unknown = null

  if (envConfig.KOTANI_BASE_URL) {
    const params = new URLSearchParams()
    params.set("source", "USDC")
    params.set("destination", fiatCurrency)
    const url = `${envConfig.KOTANI_BASE_URL.replace(/\/$/, "")}/rates?${params.toString()}`

    const response = await fetch(url, {
      method: "GET",
      headers: kotaniHeaders({ method: "GET", url }),
    })

    body = await response.json().catch(() => null)
  }

  const rate = extractKotaniRate(body, fiatCurrency)
  if (!rate) {
    throw new Error(`No ${fiatCurrency} quote available`)
  }

  return {
    amountUsdc: roundUsdc(amountUsdc),
    fiatCurrency,
    rate,
    amountFiat: Number((amountUsdc * rate).toFixed(2)),
    source: body ? "kotani" : "fallback",
    raw: body,
  }
}

export async function requestKotaniCollection({
  intentId,
  input,
  referenceId = createKotaniReferenceId(),
}: {
  intentId: string
  input: FiatPaymentIntentRequest
  referenceId?: string
}): Promise<KotaniCollectionResult> {
  void intentId

  if (!envConfig.KOTANI_BASE_URL || !envConfig.KOTANI_COLLECTION_ENDPOINT) {
    throw new Error("Kotani collection endpoint is not configured")
  }

  const endpoint = envConfig.KOTANI_COLLECTION_ENDPOINT.startsWith("/")
    ? envConfig.KOTANI_COLLECTION_ENDPOINT
    : `/${envConfig.KOTANI_COLLECTION_ENDPOINT}`
  const url = `${envConfig.KOTANI_BASE_URL.replace(/\/$/, "")}${endpoint}`

  const payload = {
      fiatAmount: input.amountFiat,
      currency: input.fiatCurrency,
      chain: "AVALANCHE",
      token: "USDC",
      receiverAddress: envConfig.PLATFORM_WALLET_ADDRESS,
      referenceId,
      callbackUrl: envConfig.KOTANI_WEBHOOK_URL,
      rateId: input.rateId,
      mobileMoney:
        input.method === "mobile_money"
          ? {
              phoneNumber: input.buyerPhone,
              accountName: input.buyerName || "XPesa Buyer",
              providerNetwork: normalizeProviderNetwork(input.buyerNetwork),
            }
          : undefined,
      bankCheckout:
        input.method === "bank_transfer"
          ? {
              fullName: input.buyerName || "XPesa Buyer",
              phoneNumber: input.buyerPhone,
              paymentMethod: "PAYBYBANK",
          }
          : undefined,
  }
  const body = JSON.stringify(payload)

  const response = await fetch(url, {
    method: "POST",
    headers: kotaniHeaders({ method: "POST", body, url }),
    body,
  })

  const responseBody = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      typeof responseBody?.message === "string"
        ? responseBody.message
        : `Kotani collection failed with ${response.status}`
    )
  }

  const responsePayload = unwrapKotaniData(responseBody)
  return {
    providerReference:
      readString(responsePayload, [
        "referenceId",
        "reference",
        "referenceNumber",
        "providerReference",
        "transactionReference",
      ]) ?? referenceId,
    providerCheckoutId: readString(responsePayload, [
      "checkoutId",
      "id",
      "transactionId",
    ]),
    raw: responseBody,
  }
}

function mapProviderStatus(
  rawStatus: string | null,
  eventType: string | null
): FiatPaymentStatus | null {
  const normalized = rawStatus?.toLowerCase().replace(/[\s-]+/g, "_")
  if (!normalized) return null
  const normalizedEventType = eventType?.toLowerCase() ?? ""

  if (["pending", "payment_pending", "initiated"].includes(normalized)) {
    return "provider_pending"
  }
  if (
    ["fiat_confirmed", "fiat_received", "paid"].includes(normalized) ||
    (normalized === "successful" &&
      normalizedEventType.includes("transaction.deposit."))
  ) {
    return "fiat_confirmed"
  }
  if (
    ["onramp_pending", "crypto_pending", "processing", "usdc_pending"].includes(
      normalized
    )
  ) {
    return "usdc_pending"
  }
  if (
    [
      "settled",
      "success",
      "successful",
      "usdc_sent",
      "completed",
      "complete",
    ].includes(normalized)
  ) {
    return "settling"
  }
  if (["failed", "cancelled", "canceled", "rejected"].includes(normalized)) {
    return "failed"
  }
  if (["expired", "timeout", "timed_out"].includes(normalized)) {
    return "expired"
  }
  return null
}

export function parseKotaniWebhook(payload: unknown): KotaniWebhookEvent {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {}
  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record

  const providerEventId =
    readString(record, ["eventId", "event_id"]) ??
    readString(data, [
      "eventId",
      "event_id",
      "id",
      "referenceId",
      "reference_id",
    ]) ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const eventType =
    readString(record, ["event", "type", "eventType", "event_type"]) ??
    readString(data, ["type", "eventType", "event_type"]) ??
    "unknown"

  const status = mapProviderStatus(
    readString(data, [
      "status",
      "state",
      "paymentStatus",
      "transactionStatus",
      "onchainStatus",
      "depositStatus",
    ]),
    eventType
  )

  return {
    providerEventId,
    eventType,
    providerReference: readString(data, [
      "referenceId",
      "reference_id",
      "reference",
      "providerReference",
      "transactionReference",
      "referenceNumber",
      "reference_number",
    ]),
    paymentIntentId: readString(data, [
      "paymentIntentId",
      "payment_intent_id",
      "intentId",
    ]),
    status,
    settledUsdc: readNumber(data, [
      "settledUsdc",
      "amountUsdc",
      "usdcAmount",
      "amount_usdc",
      "cryptoAmountReceived",
      "cryptoAmount",
      "transactionHashAmount",
    ]),
    providerTxHash: readString(data, [
      "txHash",
      "transactionHash",
      "usdcTxHash",
      "hash",
    ]),
    failureCode:
      readString(data, ["failureCode", "errorCode", "error_code", "code"]) ??
      readNestedString(data, [["error", "code"]]),
    failureMessage: readString(data, [
      "failureMessage",
      "errorMessage",
      "error_message",
      "errorDescription",
      "error_description",
      "message",
      "transactionError",
    ]) ?? readNestedString(data, [["error", "message"]]),
    payload: record,
  }
}

export async function settleFiatPaymentIntent({
  supabase,
  paymentIntentId,
  requestHeaders,
}: {
  supabase: SupabaseAdminClient
  paymentIntentId: string
  requestHeaders: Headers
}) {
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
      accessToken: intent.access_token_id as string,
      transactionId: intent.transaction_id as string,
      linkType: null,
    }
  }

  if (!envConfig.PLATFORM_WALLET_PRIVATE_KEY) {
    throw new Error("Platform wallet signer is not configured")
  }

  const amountUsdc = Number(intent.settled_usdc ?? intent.quoted_usdc)
  const amounts = calculateFiatPaymentAmounts(amountUsdc)
  const creatorWalletAddress = String(intent.creator_wallet_address)
  const platformWalletAddress = String(intent.platform_wallet_address)

  const { data: existingTransfer } = await supabase
    .from("settlement_transfers")
    .select("id, status, tx_hash")
    .eq("payment_intent_id", paymentIntentId)
    .in("status", ["submitted", "confirmed"])
    .maybeSingle()

  let payoutTxHash = existingTransfer?.tx_hash ?? null

  if (!existingTransfer) {
    const { data: transfer, error: transferError } = await supabase
      .from("settlement_transfers")
      .insert({
        payment_intent_id: paymentIntentId,
        from_wallet: platformWalletAddress,
        to_wallet: creatorWalletAddress,
        amount_usdc: amounts.creatorNetUsdc,
        status: "pending",
        attempt_count: 1,
      })
      .select()
      .single()

    if (transferError || !transfer) {
      throw new Error(transferError?.message || "Failed to create settlement")
    }

    await supabase
      .from("payment_intents")
      .update({
        status: "settling",
        platform_fee_usdc: amounts.platformFeeUsdc,
        creator_net_usdc: amounts.creatorNetUsdc,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentIntentId)

    try {
      const provider = new ethers.JsonRpcProvider(envConfig.RPC_URL)
      const wallet = new ethers.Wallet(
        envConfig.PLATFORM_WALLET_PRIVATE_KEY,
        provider
      )
      const usdc = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, wallet)
      const tx = await usdc.transfer(
        creatorWalletAddress,
        ethers.parseUnits(amounts.creatorNetUsdc.toFixed(6), 6)
      )
      payoutTxHash = tx.hash

      await supabase
        .from("settlement_transfers")
        .update({
          status: "submitted",
          tx_hash: payoutTxHash,
        })
        .eq("id", transfer.id)

      await tx.wait(1)

      await supabase
        .from("settlement_transfers")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
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
    .select("id, creator_id, type, access_expiry_type, access_ip_binding, access_max_views")
    .eq("id", intent.link_id)
    .single()

  if (linkError || !link) {
    throw new Error(linkError?.message || "Link not found")
  }

  const access = await createAccessForConfirmedPayment({
    supabase,
    link,
    fanWalletAddress: `kotani:${paymentIntentId}`,
    txHash: payoutTxHash,
    network: envConfig.PAYMENT_NETWORK_LABEL,
    amountUsdc: amounts.amountUsdc,
    platformFeeUsdc: amounts.platformFeeUsdc,
    creatorNetUsdc: amounts.creatorNetUsdc,
    requestHeaders,
    paymentIntentId,
    paymentMethod: intent.method,
  })

  await supabase
    .from("payment_intents")
    .update({
      status: "access_issued",
      access_token_id: access.accessToken,
      transaction_id: access.transactionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentIntentId)

  return access
}

export function fiatStatusResponse(status: FiatPaymentStatus) {
  return {
    status,
    message: getFiatPaymentStatusMessage(status),
  }
}
