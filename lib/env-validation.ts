import { envConfig } from "@/lib/env"

const productionRequiredEnvKeys = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_THIRDWEB_CLIENT_ID",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS",
  "AVAX_MAINNET_RPC_URL",
  "AVAX_MAINNET_USDC_CONTRACT_ADDRESS",
  "LINK_ENCRYPTION_KEY",
  "R2_ENDPOINT",
  "R2_BUCKET_NAME",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PUBLIC_BASE_URL",
  "XPESA_RECEIPT_NFT_ADDRESS",
  "XPESA_RECEIPT_MINTER_PRIVATE_KEY",
  "XPESA_RECEIPT_CHAIN_ID",
  "XPESA_RECEIPT_PAYMENT_TOKEN",
  "XPESA_QUEST_NFT_ADDRESS",
  "XPESA_QUEST_NFT_MINTER_PRIVATE_KEY",
  "XPESA_QUEST_NFT_CHAIN_ID",
  "ADMIN_EMAILS",
  "OPENAI_API_KEY",
  "KOTANI_ENV",
  "KOTANI_BASE_URL",
  "KOTANI_KEY",
  "KOTANI_SECRET",
  "KOTANI_COLLECTION_ENDPOINT",
  "KOTANI_PROD_WEBHOOK_URL",
  "KOTANI_WEBHOOK_SECRET",
] as const

export function getMissingProductionEnvKeys() {
  return productionRequiredEnvKeys.filter((key) => !process.env[key]?.trim())
}

export function assertProductionEnvReady() {
  if (!envConfig.IS_PROD) return

  const missing = getMissingProductionEnvKeys()
  if (missing.length > 0) {
    throw new Error(`Missing production env vars: ${missing.join(", ")}`)
  }
}
