export type PaymentProvider = "hedera" | "stellar" | "ckb"

export interface PaymentRequest {
  provider: PaymentProvider
  linkId: string
  amountUsdc: number
  recipientAddress: string
  platformFeePercent: number
}

export interface PaymentResult {
  txHash: string
  provider: PaymentProvider
  amountPaid: number
}
