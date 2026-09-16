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

export const withdrawalRequestSchema = z.object({
  amountUsdc: z.coerce.number().finite().positive("Amount must be greater than zero"),
  mpesaNumber: z.string().trim().min(7, "Enter a valid mobile number"),
  network: z.enum(WITHDRAWAL_NETWORKS),
  accountName: z.string().trim().optional(),
  fiatCurrency: z.string().trim().min(3).max(4).default("KES"),
  idempotencyKey: z.string().trim().min(1),
})
export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>

export function isTerminalWithdrawalStatus(status: string | null | undefined) {
  return status === "paid" || status === "failed" || status === "refunded"
}
