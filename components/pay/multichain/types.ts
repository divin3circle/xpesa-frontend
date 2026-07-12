export type MultichainToken = {
  chainId: number
  chainName: string
  tokenAddress: `0x${string}`
  symbol: "USDC"
  decimals: 6
  icon: string
}

export type BridgeTransaction = {
  id: string
  action: string
  to: `0x${string}`
  data: `0x${string}`
  value: string
  chainId: number
}

export type BridgeRoute = {
  originAmountWei: string
  destinationAmountWei: string
  estimatedExecutionTimeMs: number | null
  expiration: number | null
  transactions: BridgeTransaction[]
}

export type TokenBalance = {
  token: MultichainToken
  balance: string
  balanceNumber: number
}
