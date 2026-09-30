/**
 * Provider-agnostic fiat on/off-ramp contract.
 *
 * Both fiat flows (fan onramp: KES -> USDC; creator offramp: USDC -> M-Pesa)
 * depend on THIS interface, never on a concrete provider, so switching providers
 * (Kotani -> Pretium -> ...) is a single implementation + config change instead of
 * a repo-wide rewrite. Implementations live in lib/payments/providers/*.
 *
 * Design rule: no provider-specific shapes leak into this interface (no raw HTTP
 * headers, no provider field names, no escrow envelopes). See issue #5.
 */

export type FiatRate = {
  /** Fiat units per 1 USDC. */
  rate: number
  amountUsdc: number
  amountFiat: number
  source: "provider" | "fallback"
}

export type OnrampOrder = {
  providerReference: string
  providerCheckoutId: string | null
  raw: unknown
}

export type OfframpPayout = {
  providerReference: string
  raw: unknown
}

export type ProviderTxState =
  | "pending"
  | "processing"
  | "complete"
  | "failed"
  | "unknown"

export type ProviderTxStatus = {
  state: ProviderTxState
  settledAmountFiat: number | null
  settledAmountUsdc: number | null
  mpesaReceipt: string | null
  providerTxHash: string | null
  raw: unknown
}

/**
 * Minimal shape parsed from a provider webhook. Webhooks are HINTS ONLY — the
 * webhook route must always reconcile via getTransactionStatus before moving
 * money (Pretium does not sign webhooks; see issue #5).
 */
export type NormalizedFiatEvent = {
  providerEventId: string
  providerReference: string | null
  rawStatus: string
  payload: Record<string, unknown>
}

export type WebhookVerification = { ok: true } | { ok: false; reason: string }

export interface FiatProvider {
  /** Stable id stored in DB `provider` columns (replaces the "kotani" literal). */
  readonly id: string
  readonly enabled: boolean

  getOnrampQuote(input: {
    amountUsdc: number
    fiatCurrency: string
  }): Promise<FiatRate>
  getOfframpQuote(input: {
    amountUsdc: number
    fiatCurrency: string
  }): Promise<FiatRate>

  /** Onramp: collect fiat (STK push) and deliver stablecoin to `receiverAddress`. */
  createOnrampOrder(input: {
    reference: string
    amountFiat: number
    fiatCurrency: string
    receiverAddress: string
    chain: string
    asset: string
    buyer: { phone: string; network: string }
    callbackUrl: string
    fee?: number
  }): Promise<OnrampOrder>

  /** The on-chain address to push stablecoin to for an offramp on `chain`. */
  getOfframpSettlementAddress(chain: string): Promise<string>

  /**
   * Offramp (PUSH model): the caller has already transferred stablecoin on-chain
   * to the provider's settlement address; `transactionHash` proves it. The
   * provider then disburses fiat to the recipient.
   */
  createOfframpPayout(input: {
    reference: string
    amountFiat: number
    fiatCurrency: string
    chain: string
    transactionHash: string
    recipient: { phone: string; network: string }
    callbackUrl: string
    fee?: number
  }): Promise<OfframpPayout>

  /** Authoritative status. Webhooks are only hints — reconcile with this. */
  getTransactionStatus(input: {
    reference: string
    fiatCurrency: string
  }): Promise<ProviderTxStatus>

  verifyWebhookSignature(input: {
    payload: unknown
    headerSignature: string | null
  }): WebhookVerification

  parseWebhookEvent(payload: unknown): NormalizedFiatEvent
}
