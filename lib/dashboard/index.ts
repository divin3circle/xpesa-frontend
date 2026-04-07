import hbar from "@/public/hbar.svg"
import sol from "@/public/sol.svg"
import avax from "@/public/avax.svg"
import pol from "@/public/pol.svg"
import usdc from "@/public/usdc.svg"
import usdt from "@/public/usdt.svg"
import base from "@/public/base.svg"

export const supportedTokens = [
  { name: "USDT", symbol: "USDT", icon: usdt.src },
  { name: "USDC", symbol: "USDC", icon: usdc.src },
]

export interface SupportedToken {
  name: string
  symbol: string
  icon: string
}

export interface SupportedNetwork {
  name: string
  symbol: string
  icon: string
}

export const supportedNetworks = [
  { name: "HederaEVM", symbol: "Hedera", icon: hbar.src },
  { name: "Avalanche", symbol: "Avalanche", icon: avax.src },
  { name: "Base", symbol: "Base", icon: base.src },
  { name: "Solana", symbol: "Solana", icon: sol.src },
  { name: "Polygon", symbol: "Polygon", icon: pol.src },
]
