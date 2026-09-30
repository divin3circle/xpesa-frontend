import { envConfig } from "@/lib/env"
import { USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"

/**
 * Chains the platform moves USDC on.
 * - Onramp settlement lands on BASE (Pretium onramp supports Base/Celo, not
 *   Avalanche yet), so creators funded via fiat receive USDC on Base.
 * - Direct crypto pay + offramp use AVALANCHE; offramp may also use BASE when a
 *   creator cashes out Base USDC.
 * The platform wallet (same address on every EVM chain) needs native gas on each:
 * AVAX on Avalanche, ETH on Base.
 */
export type PaymentChain = "AVALANCHE" | "BASE"

export type ChainConfig = {
  chain: PaymentChain
  chainId: number
  rpcUrl: string
  usdcAddress: string
}

// Circle-native USDC (override per chain via env).
const CIRCLE_USDC: Record<PaymentChain, string> = {
  AVALANCHE: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  BASE: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
}

const CHAIN_IDS: Record<PaymentChain, number> = {
  AVALANCHE: 43114,
  BASE: 8453,
}

export function isPaymentChain(value: string): value is PaymentChain {
  return value === "AVALANCHE" || value === "BASE"
}

export function getChainConfig(chain: PaymentChain): ChainConfig {
  if (chain === "AVALANCHE") {
    return {
      chain,
      chainId: CHAIN_IDS.AVALANCHE,
      rpcUrl: envConfig.RPC_URL,
      usdcAddress: USDC_CONTRACT_ADDRESS || CIRCLE_USDC.AVALANCHE,
    }
  }
  return {
    chain,
    chainId: CHAIN_IDS.BASE,
    rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    usdcAddress: process.env.USDC_CONTRACT_ADDRESS_BASE || CIRCLE_USDC.BASE,
  }
}
