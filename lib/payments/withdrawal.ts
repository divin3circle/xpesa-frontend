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
