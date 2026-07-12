type SupportedPaymentChain = "H" | "A"
type PaymentNetworkFamily = "hedera" | "avalanche"

const DEFAULT_PAYMENT_CHAIN: SupportedPaymentChain = "A"
const DEFAULT_HEDERA_TESTNET_RPC_URL = "https://testnet.hashio.io/api"
const DEFAULT_AVAX_TESTNET_RPC_URL = "https://api.avax-test.network/ext/bc/C/rpc"
const DEFAULT_AVAX_MAINNET_RPC_URL = "https://api.avax.network/ext/bc/C/rpc"
const DEFAULT_HEDERA_TESTNET_USDC = "0x00000000000000000000000000000000006E4dc3"
const DEFAULT_AVAX_TESTNET_USDC = "0x5425890298aed601595a70AB815c96711a31Bc65"
const DEFAULT_AVAX_MAINNET_USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"

function normalizePaymentChain(chain: string | undefined): SupportedPaymentChain {
  const normalized = chain?.trim().toUpperCase()
  if (normalized === "A" || normalized === "H") return normalized
  return DEFAULT_PAYMENT_CHAIN
}

function getRuntimeEnv() {
  return process.env.NEXT_PUBLIC_ENV || process.env.ENV
}

function getRuntimeChain() {
  return process.env.NEXT_PUBLIC_CHAIN || process.env.CHAIN
}

function getEnvValue(publicKey: string, serverKey: string) {
  return process.env[publicKey] || process.env[serverKey]
}

export function isDevEnvironment(env: string | undefined): boolean {
  const normalized = (env || "DEV").toUpperCase()
  return normalized === "DEV" || normalized === "LOCAL"
}

export function isProductionEnvironment(env: string | undefined): boolean {
  return (env || "DEV").toUpperCase() === "PROD"
}

export function getActivePaymentChain(): SupportedPaymentChain {
  return normalizePaymentChain(getRuntimeChain())
}

export function isAvalanchePaymentChain(): boolean {
  return getActivePaymentChain() === "A"
}

export function resolvePaymentNetworkFamily(): PaymentNetworkFamily {
  return isAvalanchePaymentChain() ? "avalanche" : "hedera"
}

export function getPaymentNetworkLabel(): string {
  const networkFamily = resolvePaymentNetworkFamily()
  const isDev = isDevEnvironment(getRuntimeEnv())

  if (networkFamily === "avalanche") {
    return isDev ? "Avalanche Fuji" : "Avalanche Mainnet"
  }

  return isDev ? "Hedera Testnet" : "Hedera Mainnet"
}

export function resolvePaymentRpcUrl(): string {
  const chain = getActivePaymentChain()
  const isDev = isDevEnvironment(getRuntimeEnv())

  if (chain === "A") {
    return isDev
      ? getEnvValue("NEXT_PUBLIC_AVAX_TESTNET_RPC_URL", "AVAX_TESTNET_RPC_URL") || DEFAULT_AVAX_TESTNET_RPC_URL
      : getEnvValue("NEXT_PUBLIC_AVAX_MAINNET_RPC_URL", "AVAX_MAINNET_RPC_URL") || DEFAULT_AVAX_MAINNET_RPC_URL
  }

  return isDev
    ? process.env.HEDERA_TESTNET_RPC_URL || DEFAULT_HEDERA_TESTNET_RPC_URL
    : process.env.HEDERA_MAINNET_RPC_URL || DEFAULT_HEDERA_TESTNET_RPC_URL
}

export function resolvePaymentUsdcContractAddress(): string {
  const chain = getActivePaymentChain()
  const isDev = isDevEnvironment(getRuntimeEnv())

  if (chain === "A") {
    return isDev
      ? getEnvValue(
          "NEXT_PUBLIC_AVAX_TESTNET_USDC_CONTRACT_ADDRESS",
          "AVAX_TESTNET_USDC_CONTRACT_ADDRESS"
        ) ||
          DEFAULT_AVAX_TESTNET_USDC
      : getEnvValue(
          "NEXT_PUBLIC_AVAX_MAINNET_USDC_CONTRACT_ADDRESS",
          "AVAX_MAINNET_USDC_CONTRACT_ADDRESS"
        ) ||
          DEFAULT_AVAX_MAINNET_USDC
  }

  return isDev
    ? getEnvValue(
        "NEXT_PUBLIC_TESTNET_USDC_CONTRACT_ADDRESS",
        "TESTNET_USDC_CONTRACT_ADDRESS"
      ) || DEFAULT_HEDERA_TESTNET_USDC
    : getEnvValue(
        "NEXT_PUBLIC_MAINNET_USDC_CONTRACT_ADDRESS",
        "MAINNET_USDC_CONTRACT_ADDRESS"
      ) || DEFAULT_HEDERA_TESTNET_USDC
}

export function resolvePaymentChainId(): number {
  const chain = getActivePaymentChain()
  const isDev = isDevEnvironment(getRuntimeEnv())

  if (chain === "A") {
    return Number(
      isDev
        ? getEnvValue("NEXT_PUBLIC_AVAX_TESTNET_CHAIN_ID", "AVAX_TESTNET_CHAIN_ID") || 43113
        : getEnvValue("NEXT_PUBLIC_AVAX_MAINNET_CHAIN_ID", "AVAX_MAINNET_CHAIN_ID") || 43114
    )
  }

  return Number(isDev ? 296 : 295)
}

export function resolveExplorerUrl(txHash: string): string {
  const chain = getActivePaymentChain()
  const isDev = isDevEnvironment(envConfig.ENV)

  if (chain === "A") {
    return isDev
      ? `${process.env.AVAX_TESTNET_EXPLORER_URL || "https://testnet.snowtrace.io/tx/"}${txHash}`
      : `${process.env.AVAX_MAINNET_EXPLORER_URL || "https://snowtrace.io/tx/"}${txHash}`
  }

  const baseUrl = isDev
    ? "https://testnet.hashio.io/transaction/"
    : "https://mainnet.hashio.io/transaction/"
  return `${baseUrl}${txHash}`
}

export function getKotaniBaseUrl(): string {
  const env = process.env.KOTANI_ENV

  switch (env) {
    case "sandbox":
      return process.env.KOTANI_SANDBOX_BASE_URL || ""
    case "production":
      return process.env.KOTANI_BASE_URL || ""
    default:
      return process.env.KOTANI_SANDBOX_BASE_URL || ""
  }
}

export function getKotaniWebhookUrl(): string {
  const localWebhookUrl =
    process.env.KOTANI_LOCAL_WEBHOOK_URL ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/kotani/webhook`
  const prodWebhookUrl =
    process.env.KOTANI_PROD_WEBHOOK_URL ||
    "https://xpesacreators.xyz/api/kotani/webhook"

  return isDevEnvironment(getRuntimeEnv()) ? localWebhookUrl : prodWebhookUrl
}

export const envConfig = {
  THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  AVATARS_URL: process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/",
  CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID || "",
  AVAX_TESTNET_RPC_URL: process.env.AVAX_TESTNET_RPC_URL || DEFAULT_AVAX_TESTNET_RPC_URL,
  AVAX_MAINNET_RPC_URL: process.env.AVAX_MAINNET_RPC_URL || DEFAULT_AVAX_MAINNET_RPC_URL,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || "",
  R2_TOKEN_VALUE: process.env.R2_TOKEN_VALUE || "",
  R2_ENDPOINT: process.env.R2_ENDPOINT || "",
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "",
  ENV: getRuntimeEnv() || "DEV",
  IS_DEV: isDevEnvironment(getRuntimeEnv()),
  IS_PROD: isProductionEnvironment(getRuntimeEnv()),
  FEE: process.env.FEE || "5",
  PREVIEW_RATE_LIMIT: Number(process.env.PREVIEW_RATE_LIMIT || 2),
  PREVIEW_RATE_LIMIT_WINDOW_SECONDS: Number(process.env.PREVIEW_RATE_LIMIT_WINDOW_SECONDS || 60),
  DOWNLOAD_RATE_LIMIT: Number(process.env.DOWNLOAD_RATE_LIMIT || 1),
  DOWNLOAD_RATE_LIMIT_WINDOW_SECONDS: Number(process.env.DOWNLOAD_RATE_LIMIT_WINDOW_SECONDS || 60),
  SENSITIVE_ROUTE_RATE_LIMIT: Number(process.env.SENSITIVE_ROUTE_RATE_LIMIT || 10),
  SENSITIVE_ROUTE_RATE_LIMIT_WINDOW_SECONDS: Number(
    process.env.SENSITIVE_ROUTE_RATE_LIMIT_WINDOW_SECONDS || 60
  ),
  UPLOAD_RATE_LIMIT: Number(process.env.UPLOAD_RATE_LIMIT || 20),
  UPLOAD_RATE_LIMIT_WINDOW_SECONDS: Number(process.env.UPLOAD_RATE_LIMIT_WINDOW_SECONDS || 60),
  MAX_CREATOR_STORAGE_BYTES: Number(process.env.MAX_CREATOR_STORAGE_BYTES || 1024 * 1024 * 1024),
  PREVIEW_SESSION_MAX_AGE_SECONDS: Number(process.env.PREVIEW_SESSION_MAX_AGE_SECONDS || 60 * 60),
  CHAIN: getActivePaymentChain(),
  PAYMENT_NETWORK: resolvePaymentNetworkFamily(),
  PAYMENT_NETWORK_LABEL: getPaymentNetworkLabel(),
  RPC_URL: resolvePaymentRpcUrl(),
  USDC_CONTRACT_ADDRESS: resolvePaymentUsdcContractAddress(),
  CHAIN_ID: resolvePaymentChainId(),
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GOOGLE_APPLICATION_CREDETIALS || "",
  SHEET_ID: process.env.SHEET_ID || "",
  GOOGLE_APPLICATION_SCOPES: ["https://www.googleapis.com/auth/spreadsheets"],
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  PLATFORM_WALLET_ADDRESS: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || "",
  LINK_ENCRYPTION_KEY: process.env.LINK_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODERATION_MODEL: process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest",
  ADMIN_EMAILS: process.env.ADMIN_EMAILS || "",
  KOTANI_SECRET: process.env.KOTANI_SECRET || "",
  KOTANI_KEY: process.env.KOTANI_KEY || "",
  KOTANI_ENV: process.env.KOTANI_ENV || "sandbox",
  KOTANI_BASE_URL: getKotaniBaseUrl(),
  KOTANI_COLLECTION_ENDPOINT: process.env.KOTANI_COLLECTION_ENDPOINT || "",
  KOTANI_PROD_WEBHOOK_URL: process.env.KOTANI_PROD_WEBHOOK_URL || "",
  KOTANI_LOCAL_WEBHOOK_URL: process.env.KOTANI_LOCAL_WEBHOOK_URL || "",
  KOTANI_WEBHOOK_URL: getKotaniWebhookUrl(),
  KOTANI_WEBHOOK_SECRET: process.env.KOTANI_WEBHOOK_SECRET || "",
  PLATFORM_WALLET_PRIVATE_KEY: process.env.PLATFORM_WALLET_PRIVATE_KEY || "",
  XPESA_RECEIPT_NFT_ADDRESS: process.env.XPESA_RECEIPT_NFT_ADDRESS || "",
  XPESA_RECEIPT_MINTER_PRIVATE_KEY: process.env.XPESA_RECEIPT_MINTER_PRIVATE_KEY || "",
  XPESA_RECEIPT_CHAIN_ID: Number(
    process.env.XPESA_RECEIPT_CHAIN_ID || resolvePaymentChainId()
  ),
  XPESA_RECEIPT_PAYMENT_TOKEN: process.env.XPESA_RECEIPT_PAYMENT_TOKEN || resolvePaymentUsdcContractAddress(),
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL || "",
}
