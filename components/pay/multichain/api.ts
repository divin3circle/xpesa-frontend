import type { BridgeRoute, MultichainToken } from "./types"

export async function fetchMultichainTokens() {
  const response = await fetch("/api/payments/multichain/tokens")
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || "Failed to load chains")
  return body.tokens as MultichainToken[]
}

export async function fetchBridgeQuote(input: {
  linkId: string
  amountUsdc: number
  payerWalletAddress: string
  sourceChainId: number
  sourceTokenAddress: string
}) {
  const response = await fetch("/api/payments/multichain/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || "Route unavailable")
  return body.route as BridgeRoute
}

export async function createBridgeIntent(input: {
  linkId: string
  amountUsdc: number
  payerWalletAddress: string
  sourceChainId: number
  sourceTokenAddress: string
  originAmountWei: string
  destinationAmountWei: string
  route: BridgeRoute
}) {
  const response = await fetch("/api/payments/multichain/intents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || "Failed to create intent")
  return body.intent as { id: string }
}

export async function updateBridgeStatus(input: {
  intentId: string
  originTxHash: string
  originChainId: number
  transactionId?: string
}) {
  const response = await fetch("/api/payments/multichain/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || "Status check failed")
  return body as { status: string; isComplete: boolean }
}

export async function settleBridgeIntent(intentId: string) {
  const response = await fetch("/api/payments/multichain/settle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intentId }),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || "Settlement failed")
  return body as { accessToken: string; linkType: string }
}
