import { envConfig } from "@/lib/env"

export type QuestBadgeConfig = {
  chainId: number
  contractAddress: string
  rpcUrl: string
  minterPrivateKey: string
}

function withHexPrefix(value: string) {
  return value.startsWith("0x") ? value : `0x${value}`
}

function resolveRpcUrl(chainId: number) {
  if (chainId === 43114) return envConfig.AVAX_MAINNET_RPC_URL
  if (chainId === 43113) return envConfig.AVAX_TESTNET_RPC_URL
  return envConfig.RPC_URL
}

export function getQuestBadgeConfig(): QuestBadgeConfig {
  const chainId = envConfig.XPESA_QUEST_NFT_CHAIN_ID
  return {
    chainId,
    contractAddress: envConfig.XPESA_QUEST_NFT_ADDRESS,
    rpcUrl: resolveRpcUrl(chainId),
    minterPrivateKey: envConfig.XPESA_QUEST_NFT_MINTER_PRIVATE_KEY
      ? withHexPrefix(envConfig.XPESA_QUEST_NFT_MINTER_PRIVATE_KEY)
      : "",
  }
}

export function assertQuestBadgeConfig(config = getQuestBadgeConfig()) {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Quest NFT minting is not configured: ${missing.join(", ")}`)
  }

  return config
}
