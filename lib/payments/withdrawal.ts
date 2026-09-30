import { z } from "zod"

/**
 * Creator offramp (withdrawal) domain: USDC on Avalanche → KES to M-Pesa via Kotani.
 * Distinct from the onramp/purchase `FiatPaymentStatus` in `./fiat.ts`.
 */

export const WITHDRAWAL_STATUSES = [
  "requested",
  "onchain_sent",
  "provider_processing",
  "paid",
  "failed",
  "refunded",
] as const
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number]

export const WITHDRAWAL_NETWORKS = [
  "mpesa",
  "airtel",
  "mtn",
  "vodafone",
] as const
export type WithdrawalNetwork = (typeof WITHDRAWAL_NETWORKS)[number]

/** Chains a creator can cash out USDC from (offramp settles on either). */
export const WITHDRAWAL_CHAINS = ["AVALANCHE", "BASE"] as const
export type WithdrawalChain = (typeof WITHDRAWAL_CHAINS)[number]

export const withdrawalRequestSchema = z.object({
  amountUsdc: z.coerce.number().finite().positive("Amount must be greater than zero"),
  mpesaNumber: z.string().trim().min(7, "Enter a valid mobile number"),
  network: z.enum(WITHDRAWAL_NETWORKS),
  accountName: z.string().trim().optional(),
  fiatCurrency: z.string().trim().min(3).max(4).default("KES"),
  chain: z.enum(WITHDRAWAL_CHAINS).default("AVALANCHE"),
  idempotencyKey: z.string().trim().min(1),
})
export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>

/** Provider per-currency minimum fiat amount for an offramp payout. */
export const OFFRAMP_MIN_FIAT: Record<string, number> = { KES: 100 }

/**
 * Validate an offramp amount against the fiat minimum and an optional per-tx USD
 * cap (env OFFRAMP_MAX_USD — e.g. Pretium's unverified $0.50 limit; raise it after
 * KYB/KYC, or leave unset/0 for no cap). Returns an error string, or null if ok.
 *
 * This MUST be enforced before any on-chain transfer: the offramp is push-model
 * (funds move to the provider, then we request the payout), so relaying an amount
 * the provider will reject would strand the creator's USDC at the settlement
 * address with no payout.
 */
export function validateOfframpAmount(input: {
  amountUsdc: number
  amountFiat: number
  fiatCurrency: string
}): string | null {
  const min = OFFRAMP_MIN_FIAT[input.fiatCurrency] ?? 0
  if (input.amountFiat < min) {
    return `Withdrawals need at least ${min} ${input.fiatCurrency} (this is about ${Math.round(
      input.amountFiat
    )} ${input.fiatCurrency}).`
  }
  const maxUsd = Number(process.env.OFFRAMP_MAX_USD ?? "0")
  if (maxUsd > 0 && input.amountUsdc > maxUsd) {
    return `Withdrawals are currently limited to $${maxUsd} per transaction.`
  }
  return null
}

/** Map an internal payout rail to the provider's mobile-network (carrier) name. */
export function withdrawalNetworkToCarrier(network: WithdrawalNetwork): string {
  switch (network) {
    case "mpesa":
      return "Safaricom"
    case "airtel":
      return "Airtel"
    case "mtn":
      return "MTN"
    case "vodafone":
      return "Vodafone"
  }
}

export function isTerminalWithdrawalStatus(status: string | null | undefined) {
  return status === "paid" || status === "failed" || status === "refunded"
}
