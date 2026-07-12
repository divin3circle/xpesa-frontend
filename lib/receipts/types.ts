export type ReceiptStatus =
  | "eligible"
  | "metadata_ready"
  | "minting"
  | "minted"
  | "failed"

export type ReceiptPaymentContext = {
  accessTokenId: string
  transactionId: string
  paymentIntentId: string | null
  linkId: string
  creatorId: string
  payerWalletAddress: string
  creatorWalletAddress: string
  creatorName: string
  paymentTxHash: `0x${string}`
  amountUsdc: number
  createdAt: string
}

export type ReceiptMetadataInput = ReceiptPaymentContext & {
  paymentId: `0x${string}`
  points: number
  networkName: string
  imageUri: string
}

export type ReceiptRecord = {
  id: string
  status: ReceiptStatus
  token_id: string | null
  token_uri: string | null
  image_uri: string | null
  mint_tx_hash: string | null
  failure_message: string | null
}
