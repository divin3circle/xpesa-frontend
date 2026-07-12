import { z } from "zod"

export const FIAT_PAYMENT_METHODS = [
  "mobile_money",
  "bank_transfer",
] as const

export const FIAT_PAYMENT_STATUSES = [
  "created",
  "provider_pending",
  "fiat_confirmed",
  "usdc_pending",
  "settling",
  "access_issued",
  "failed",
  "expired",
] as const

export type FiatPaymentMethod = (typeof FIAT_PAYMENT_METHODS)[number]
export type FiatPaymentStatus = (typeof FIAT_PAYMENT_STATUSES)[number]

export const XPESA_PLATFORM_FEE_RATE = 0.05

const positiveMoney = z.coerce
  .number()
  .finite()
  .positive("Amount must be greater than zero")

export const fiatQuoteRequestSchema = z.object({
  amountUsdc: positiveMoney,
  fiatCurrency: z.string().trim().min(3).max(4).default("KES"),
})

export const fiatPaymentIntentRequestSchema = z.object({
  linkId: z.string().uuid(),
  amountUsdc: positiveMoney,
  method: z.enum(FIAT_PAYMENT_METHODS),
  fiatCurrency: z.string().trim().min(3).max(4).default("KES"),
  amountFiat: positiveMoney,
  rateId: z.string().trim().optional(),
  buyerName: z.string().trim().optional(),
  buyerPhone: z.string().trim().optional(),
  buyerCountry: z.string().trim().min(2).max(3).default("KE"),
  buyerNetwork: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  bankAccountRef: z.string().trim().optional(),
})

export type FiatPaymentIntentRequest = z.infer<
  typeof fiatPaymentIntentRequestSchema
>

export type FiatPaymentAmounts = {
  amountUsdc: number
  platformFeeUsdc: number
  creatorNetUsdc: number
}

export function roundUsdc(value: number) {
  return Number(value.toFixed(6))
}

export function calculateFiatPaymentAmounts(
  amountUsdc: number
): FiatPaymentAmounts {
  const platformFeeUsdc = roundUsdc(amountUsdc * XPESA_PLATFORM_FEE_RATE)
  return {
    amountUsdc: roundUsdc(amountUsdc),
    platformFeeUsdc,
    creatorNetUsdc: roundUsdc(amountUsdc - platformFeeUsdc),
  }
}

export function isTerminalFiatPaymentStatus(status: string | null | undefined) {
  return status === "access_issued" || status === "failed" || status === "expired"
}

export function getFiatPaymentStatusMessage(status: FiatPaymentStatus) {
  switch (status) {
    case "created":
      return "Payment request created"
    case "provider_pending":
      return "Waiting for provider confirmation"
    case "fiat_confirmed":
      return "Local payment confirmed"
    case "usdc_pending":
      return "Waiting for USDC settlement"
    case "settling":
      return "Sending creator payout"
    case "access_issued":
      return "Access ready"
    case "failed":
      return "Payment failed"
    case "expired":
      return "Payment expired"
  }
}
