import hbar from "@/public/hbar.svg"
import sol from "@/public/sol.svg"
import avax from "@/public/avax.svg"
import base from "@/public/base.svg"
import pol from "@/public/pol.svg"
import usdc from "@/public/usdc.svg"
import usdt from "@/public/usdt.svg"

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
  { name: "Hedera", symbol: "Hedera", icon: hbar.src },
  { name: "hedera-mainnet", symbol: "Hedera", icon: hbar.src },
  { name: "hedera-testnet", symbol: "Hedera", icon: hbar.src },
  { name: "Avalanche Fuji", symbol: "Avalanche", icon: avax.src },
  { name: "Solana", symbol: "Solana", icon: sol.src },
  { name: "Polygon", symbol: "Polygon", icon: pol.src },
]

// Network labels are stored in several formats — "Avalanche Mainnet"/"Avalanche
// Fuji" (crypto), "avalanche"/"base" (fiat settlement), chain codes, etc. Resolve
// any of them to a logo by keyword so the network column never shows a broken
// image. Checked as a fallback after the exact-name map.
const NETWORK_LOGO_KEYWORDS: { icon: string; keywords: string[] }[] = [
  { icon: avax.src, keywords: ["avalanche", "avax"] },
  { icon: base.src, keywords: ["base"] },
  { icon: hbar.src, keywords: ["hedera", "hbar"] },
  { icon: sol.src, keywords: ["solana", "sol"] },
  { icon: pol.src, keywords: ["polygon", "matic", "pol"] },
]

export function resolveNetworkLogo(network?: string | null): string | null {
  if (!network) return null
  const n = network.toLowerCase().trim()
  const entry = NETWORK_LOGO_KEYWORDS.find((e) =>
    e.keywords.some((k) => n.includes(k))
  )
  return entry?.icon ?? null
}
