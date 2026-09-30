import { envConfig } from "@/lib/env"
import { roundUsdc } from "@/lib/payments/fiat"
import {
  kotaniHeaders,
  unwrapKotaniData,
  readString,
  normalizeProviderNetwork,
  extractKotaniRate,
} from "@/lib/payments/kotani-client"

/**
 * Creator offramp (crypto → fiat): USDC on Avalanche → KES to M-Pesa via Kotani.
 * Non-custodial — the creator's signed EIP-3009 authorization sends USDC straight to the
 * Kotani deposit address; the platform only relays. Separate from the onramp/collection flow
 * in `kotani.ts`.
 */

function offrampBaseUrl() {
  if (!envConfig.KOTANI_BASE_URL || !envConfig.KOTANI_OFFRAMP_ENDPOINT) {
    throw new Error("Kotani offramp endpoint is not configured")
  }
  const endpoint = envConfig.KOTANI_OFFRAMP_ENDPOINT.startsWith("/")
    ? envConfig.KOTANI_OFFRAMP_ENDPOINT
    : `/${envConfig.KOTANI_OFFRAMP_ENDPOINT}`
  return `${envConfig.KOTANI_BASE_URL.replace(/\/$/, "")}${endpoint}`
}

/** Offramp rate quote (Kotani `GET /rates/offramp-rate`). */
export async function getKotaniOfframpQuote({
  amountUsdc,
  fiatCurrency,
}: {
  amountUsdc: number
  fiatCurrency: string
}) {
  let body: unknown = null
  if (envConfig.KOTANI_BASE_URL) {
    const base = envConfig.KOTANI_BASE_URL.replace(/\/$/, "")
    const path = envConfig.KOTANI_OFFRAMP_RATE_ENDPOINT.startsWith("/")
      ? envConfig.KOTANI_OFFRAMP_RATE_ENDPOINT
      : `/${envConfig.KOTANI_OFFRAMP_RATE_ENDPOINT}`
    const params = new URLSearchParams({ source: "USDC", destination: fiatCurrency })
    const url = `${base}${path}?${params.toString()}`
    const response = await fetch(url, {
      method: "GET",
      headers: kotaniHeaders({ method: "GET", url }),
    })
    body = await response.json().catch(() => null)
  }
  const rate = extractKotaniRate(body, fiatCurrency)
  if (!rate) throw new Error(`No ${fiatCurrency} offramp quote available`)
  return {
    amountUsdc: roundUsdc(amountUsdc),
    fiatCurrency,
    rate,
    amountFiat: Number((amountUsdc * rate).toFixed(2)),
    source: body ? "kotani" : "fallback",
  }
}

export type KotaniOfframpResult = {
  depositAddress: string
  providerReference: string
  raw: unknown
}

/** Initiate an offramp (Kotani `POST /offramp`). Returns the deposit address to send USDC to. */
export async function requestKotaniOfframp({
  referenceId,
  amountUsdc,
  fiatCurrency,
  mpesaNumber,
  accountName,
  network,
}: {
  referenceId: string
  amountUsdc: number
  fiatCurrency: string
  mpesaNumber: string
  accountName: string
  network: string
}): Promise<KotaniOfframpResult> {
  const url = offrampBaseUrl()
  const payload = {
    cryptoAmount: amountUsdc,
    currency: fiatCurrency,
    chain: "AVALANCHE",
    token: "USDC",
    referenceId,
    callbackUrl: envConfig.KOTANI_WEBHOOK_URL,
    mobileMoneyReceiver: {
      phoneNumber: mpesaNumber,
      accountName: accountName || "XPesa Creator",
      networkProvider: normalizeProviderNetwork(network),
    },
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
        : `Kotani offramp failed with ${response.status}`
    )
  }
  const data = unwrapKotaniData(responseBody)
  const depositAddress = readString(data, [
    "depositAddress",
    "deposit_address",
    "escrowAddress",
    "escrow_address",
  ])
  if (!depositAddress) {
    throw new Error("Kotani offramp did not return a deposit address")
  }
  return {
    depositAddress,
    providerReference:
      readString(data, ["referenceId", "reference", "reference_id"]) ??
      referenceId,
    raw: responseBody,
  }
}

/** Poll offramp status (Kotani `GET /offramp/:referenceId`) — reconciler source of truth. */
export async function getKotaniOfframpStatus(referenceId: string) {
  const url = `${offrampBaseUrl()}/${referenceId}`
  const response = await fetch(url, {
    method: "GET",
    headers: kotaniHeaders({ method: "GET", url }),
  })
  const responseBody = await response.json().catch(() => ({}))
  const data = unwrapKotaniData(responseBody)
  return {
    status: readString(data, ["status", "state"]) ?? "unknown",
    onchainStatus: readString(data, ["onchainStatus", "onchain_status"]),
    mpesaReceipt: readString(data, [
      "mpesaReceipt",
      "receipt",
      "providerReceipt",
      "mpesa_receipt",
    ]),
    raw: responseBody,
  }
}

/** Map a Kotani offramp webhook/status event to our terminal withdrawal outcome. */
export function mapKotaniOfframpStatus(
  raw: string | null
): "paid" | "failed" | "refunded" | "provider_processing" {
  const normalized = raw?.toUpperCase().replace(/[\s-]+/g, "_")
  if (!normalized) return "provider_processing"
  if (["SUCCESS", "SUCCESSFUL", "COMPLETED", "SETTLED", "PAID"].includes(normalized)) {
    return "paid"
  }
  if (["REFUNDED", "REFUND_SUCCESS"].includes(normalized)) return "refunded"
  if (["FAILED", "REFUND_FAILED", "CANCELLED", "CANCELED", "REJECTED"].includes(normalized)) {
    return "failed"
  }
  return "provider_processing"
}
