export type ReceiptMintRecord = {
  status: "eligible" | "metadata_ready" | "minting" | "minted" | "failed"
  token_id: string | null
  token_uri: string | null
  image_uri: string | null
  mint_tx_hash: string | null
  failure_message: string | null
}
