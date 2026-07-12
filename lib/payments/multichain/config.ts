import { envConfig } from "@/lib/env"

export type MultichainToken = {
  chainId: number
  chainName: string
  tokenAddress: `0x${string}`
  symbol: "USDC"
  decimals: 6
  icon: string
}

export const AVALANCHE_USDC: MultichainToken = {
  chainId: 43114,
  chainName: "Avalanche",
  tokenAddress: envConfig.USDC_CONTRACT_ADDRESS as `0x${string}`,
  symbol: "USDC",
  decimals: 6,
  icon: "/usdcavax.png",
}

export const MULTICHAIN_USDC_TOKENS: MultichainToken[] = [
  {
    chainId: 8453,
    chainName: "Base",
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    decimals: 6,
    icon: "/usdc.svg",
  },
  {
    chainId: 1,
    chainName: "Ethereum",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    decimals: 6,
    icon: "/usdc.svg",
  },
  {
    chainId: 137,
    chainName: "Polygon",
    tokenAddress: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    symbol: "USDC",
    decimals: 6,
    icon: "/usdc.svg",
  },
  {
    chainId: 56,
    chainName: "BNB Chain",
    tokenAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    symbol: "USDC",
    decimals: 6,
    icon: "/usdc.svg",
  },
  {
    chainId: 42161,
    chainName: "Arbitrum",
    tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    symbol: "USDC",
    decimals: 6,
    icon: "/usdc.svg",
  },
  {
    chainId: 10,
    chainName: "Optimism",
    tokenAddress: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    symbol: "USDC",
    decimals: 6,
    icon: "/usdc.svg",
  },
]

export function findMultichainToken(chainId: number) {
  return MULTICHAIN_USDC_TOKENS.find((token) => token.chainId === chainId)
}
