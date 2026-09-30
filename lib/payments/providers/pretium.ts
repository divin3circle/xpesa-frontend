import type {
  FiatProvider,
  FiatRate,
  NormalizedFiatEvent,
  OfframpPayout,
  OnrampOrder,
  ProviderTxState,
  ProviderTxStatus,
  WebhookVerification,
} from "@/lib/payments/fiat-provider"

/**
 * Pretium (Xwift) fiat provider. Docs: https://docs.xwift.africa
 * Host: https://api.xwift.africa · Auth: `x-api-key` header (no Bearer/HMAC).
 *
 * STATUS: SCAFFOLD. Endpoints, auth, and request bodies follow the published
 * docs, but Pretium does not publish full response `data` shapes, offers no
 * sandbox (a 14-day live trial instead), and does NOT sign webhooks. Every part
 * marked `TODO(trial)` must be confirmed against real responses captured during
 * the trial before this is enabled on mainnet. Open questions: issue #5.
 *
 * Not imported anywhere yet — this is additive groundwork for the Kotani -> Pretium
 * migration and does not touch the live payment flow.
 */

const DEFAULT_BASE_URL = "https://api.xwift.africa"

type PretiumEnvelope<T = Record<string, unknown>> = {
  code?: number
  message?: string
  data?: T
}

function mapPretiumStatus(raw: string | null | undefined): ProviderTxState {
  switch ((raw ?? "").toUpperCase()) {
    case "PENDING":
      return "pending"
    case "PROCESSING":
      return "processing"
    case "COMPLETE":
      return "complete"
    case "FAILED":
    case "CANCELLED":
    case "EXPIRED":
      return "failed"
    default:
      return "unknown"
  }
}

export function createPretiumProvider(config?: {
  apiKey?: string
  baseUrl?: string
  settlementAddress?: string
  enabled?: boolean
}): FiatProvider {
  const apiKey = config?.apiKey ?? process.env.PRETIUM_API_KEY
  const baseUrl = (
    config?.baseUrl ??
    process.env.PRETIUM_BASE_URL ??
    DEFAULT_BASE_URL
  ).replace(/\/$/, "")
  const settlementAddress =
    config?.settlementAddress ?? process.env.PRETIUM_SETTLEMENT_ADDRESS
  const enabled = config?.enabled ?? process.env.FIAT_PROVIDER === "pretium"

  async function call<T>(
    path: string,
    body: unknown
  ): Promise<PretiumEnvelope<T>> {
    if (!apiKey) throw new Error("PRETIUM_API_KEY is not configured")
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as PretiumEnvelope<T>
    if (!res.ok || (json.code !== undefined && json.code >= 400)) {
      throw new Error(`Pretium ${path} failed: ${json.message ?? res.status}`)
    }
    return json
  }

  async function quote(
    fiatCurrency: string,
    amountUsdc: number,
    direction: "onramp" | "offramp"
  ): Promise<FiatRate> {
    const json = await call<{ buying_rate: number; selling_rate: number }>(
      "/v1/exchange-rate",
      { currency_code: fiatCurrency }
    )
    // buying_rate = fiat per USDC the payer funds (onramp);
    // selling_rate = fiat per USDC we receive on payout (offramp).
    const rate =
      direction === "onramp"
        ? json.data?.buying_rate
        : json.data?.selling_rate
    if (!rate) throw new Error(`No ${fiatCurrency} rate from Pretium`)
    return {
      rate,
      amountUsdc,
      amountFiat: Number((amountUsdc * rate).toFixed(2)),
      source: "provider",
    }
  }

  return {
    id: "pretium",
    enabled: Boolean(enabled && apiKey),

    getOnrampQuote: ({ amountUsdc, fiatCurrency }) =>
      quote(fiatCurrency, amountUsdc, "onramp"),
    getOfframpQuote: ({ amountUsdc, fiatCurrency }) =>
      quote(fiatCurrency, amountUsdc, "offramp"),

    async createOnrampOrder(input): Promise<OnrampOrder> {
      // NOTE: confirm Avalanche is an allowed ONRAMP chain for this account
      // before relying on `input.chain === "AVALANCHE"` here (issue #5, Q1).
      const json = await call<Record<string, unknown>>(
        `/v1/onramp/${input.fiatCurrency}`,
        {
          shortcode: input.buyer.phone,
          amount: input.amountFiat,
          mobile_network: input.buyer.network,
          address: input.receiverAddress,
          chain: input.chain,
          asset: input.asset,
          fee: input.fee,
          callback_url: input.callbackUrl,
          reference: input.reference,
        }
      )
      const data = json.data ?? {}
      // TODO(trial): confirm the real `data` field name for the transaction code.
      const ref = String(data.transaction_code ?? data.reference ?? input.reference)
      return {
        providerReference: ref,
        providerCheckoutId: (data.transaction_code as string) ?? null,
        raw: json,
      }
    },

    async getOfframpSettlementAddress(chain: string): Promise<string> {
      // Simplest + most stable UX: a static per-account settlement address per
      // chain, configured via env (no extra round-trip, no per-order address to
      // track, invisible to the creator). We support two chains for offramp:
      // Avalanche + Base. TODO(trial): confirm with Pretium the address is static
      // per account; if they return a per-order address, fetch it here instead.
      const perChain =
        process.env[`PRETIUM_SETTLEMENT_ADDRESS_${chain.toUpperCase()}`]
      const address = perChain ?? settlementAddress
      if (!address) {
        throw new Error(
          `No Pretium settlement address configured for chain ${chain}`
        )
      }
      return address
    },

    async createOfframpPayout(input): Promise<OfframpPayout> {
      const json = await call<Record<string, unknown>>(
        `/v1/pay/${input.fiatCurrency}`,
        {
          transaction_hash: input.transactionHash,
          chain: input.chain,
          type: "MOBILE",
          shortcode: input.recipient.phone,
          amount: input.amountFiat,
          mobile_network: input.recipient.network,
          fee: input.fee,
          callback_url: input.callbackUrl,
          reference: input.reference,
        }
      )
      const data = json.data ?? {}
      return {
        providerReference: String(
          data.transaction_code ?? data.reference ?? input.reference
        ),
        raw: json,
      }
    },

    async getTransactionStatus({ reference, fiatCurrency }): Promise<ProviderTxStatus> {
      const json = await call<Record<string, unknown>>(
        `/v1/status/${fiatCurrency}`,
        { transaction_code: reference }
      )
      const data = json.data ?? {}
      // TODO(trial): confirm real field names for settled amount / receipt / hash.
      return {
        state: mapPretiumStatus(data.status as string),
        settledAmountFiat: typeof data.amount === "number" ? data.amount : null,
        settledAmountUsdc: null,
        mpesaReceipt: (data.receipt_number as string) ?? null,
        providerTxHash: (data.transaction_hash as string) ?? null,
        raw: json,
      }
    },

    // Pretium does not sign webhooks (issue #5, Q2): treat every webhook as an
    // unauthenticated hint; the route MUST reconcile via getTransactionStatus.
    verifyWebhookSignature(): WebhookVerification {
      return { ok: true }
    },

    parseWebhookEvent(payload: unknown): NormalizedFiatEvent {
      const p = (payload ?? {}) as Record<string, unknown>
      return {
        providerEventId: String(p.transaction_code ?? p.order_id ?? ""),
        providerReference:
          (p.transaction_code as string) ?? (p.order_id as string) ?? null,
        rawStatus: String(p.status ?? ""),
        payload: p,
      }
    },
  }
}
