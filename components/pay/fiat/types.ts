import type { FiatPaymentMethod, FiatPaymentStatus } from "@/lib/payments/fiat"

export type FiatPaymentIntent = {
  id: string
  status: FiatPaymentStatus
  method: FiatPaymentMethod
  fiat_currency: string
  amount_fiat: number | string
  quoted_usdc: number | string
  access_token_id: string | null
  failure_message: string | null
}

export type FiatQuote = {
  amountUsdc: number
  fiatCurrency: string
  rate: number
  amountFiat: number
  source: string
}

export type FiatCheckoutStep = "quote" | "details" | "review"
