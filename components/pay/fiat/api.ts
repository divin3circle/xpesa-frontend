import type { FiatPaymentMethod } from "@/lib/payments/fiat"
import type { FiatPaymentIntent, FiatQuote } from "./types"

export async function createFiatIntent(input: {
  linkId: string
  amountUsdc: number
  method: FiatPaymentMethod
  quote: FiatQuote
  buyerPhone: string
  buyerCountry: string
  buyerNetwork?: string
  bankName?: string
  bankAccountRef?: string
}) {
  const response = await fetch("/api/payments/fiat/intents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      linkId: input.linkId,
      amountUsdc: input.amountUsdc,
      method: input.method,
      fiatCurrency: input.quote.fiatCurrency,
      amountFiat: input.quote.amountFiat,
      buyerPhone: input.buyerPhone,
      buyerCountry: input.buyerCountry,
      buyerNetwork: input.buyerNetwork,
      bankName: input.bankName,
      bankAccountRef: input.bankAccountRef,
    }),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || "Payment failed")
  return body.intent as FiatPaymentIntent
}
