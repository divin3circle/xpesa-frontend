import crypto from "crypto"

import { envConfig } from "@/lib/env"
import { KOTANI_FALLBACK_RATES } from "@/lib/kotani-pay"

/**
 * Low-level Kotani HTTP client helpers shared by the onramp (`kotani.ts`) and offramp
 * (`kotani-offramp.ts`) modules: request signing/auth, response field extraction, and rate
 * parsing. Kept dependency-light so the offramp path doesn't pull in onramp/settlement code.
 */

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

export function kotaniHeaders({
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

export function readString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return null
}

export function readNumber(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key]
    const numeric = typeof value === "number" ? value : Number(value)
    if (Number.isFinite(numeric) && numeric > 0) return numeric
  }
  return null
}

export function readNestedString(
  payload: Record<string, unknown>,
  paths: string[][]
) {
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

export function normalizeProviderNetwork(network: string | undefined) {
  const normalized = network?.trim().toUpperCase()
  if (!normalized || normalized === "MPESA" || normalized === "M-PESA") {
    return "MPESA"
  }
  return normalized
}

export function unwrapKotaniData(body: unknown) {
  if (!body || typeof body !== "object") return {}
  const record = body as Record<string, unknown>
  return record.data && typeof record.data === "object"
    ? (record.data as Record<string, unknown>)
    : record
}

export function isSignedKotaniEnvelope(payload: unknown): payload is {
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
