import { envConfig } from "@/lib/env"

export type ReceiptNetworkConfig = {
  chainId: number
  contractAddress: string
  paymentToken: string
  rpcUrl: string
  minterPrivateKey: string
}

function withHexPrefix(value: string) {
  return value.startsWith("0x") ? value : `0x${value}`
}

function resolveReceiptRpcUrl(chainId: number) {
  if (chainId === 43114) {
    return envConfig.AVAX_MAINNET_RPC_URL
  }

  if (chainId === 43113) {
    return envConfig.AVAX_TESTNET_RPC_URL
  }

  return envConfig.RPC_URL
}

export function getReceiptConfig(): ReceiptNetworkConfig {
  const chainId = envConfig.XPESA_RECEIPT_CHAIN_ID

  return {
    chainId,
    contractAddress: envConfig.XPESA_RECEIPT_NFT_ADDRESS,
    paymentToken: envConfig.XPESA_RECEIPT_PAYMENT_TOKEN,
    rpcUrl: resolveReceiptRpcUrl(chainId),
    minterPrivateKey: withHexPrefix(envConfig.XPESA_RECEIPT_MINTER_PRIVATE_KEY),
  }
}

export function assertReceiptConfig(config = getReceiptConfig()) {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Receipt minting is not configured: ${missing.join(", ")}`)
  }

  return config
}
