import { Bridge } from "thirdweb"

import { envConfig } from "@/lib/env"
import { client } from "@/lib/utils"
import { AVALANCHE_USDC } from "./config"

function normalize(value?: string | null) {
  return value?.toLowerCase() ?? ""
}

export async function getBridgeStatus(input: {
  originTxHash: `0x${string}`
  originChainId: number
  transactionId?: string
}) {
  return Bridge.status({
    transactionHash: input.originTxHash,
    chainId: input.originChainId,
    transactionId: input.transactionId,
    client,
  })
}

export function assertCompletedAvalancheSettlement(
  status: Awaited<ReturnType<typeof getBridgeStatus>>,
  expectedAmountWei: string
) {
  if (status.status !== "COMPLETED") return false
  if (status.destinationChainId !== AVALANCHE_USDC.chainId) return false
  if (
    normalize(status.destinationTokenAddress) !==
    normalize(AVALANCHE_USDC.tokenAddress)
  ) {
    return false
  }
  if (BigInt(status.destinationAmount ?? 0) < BigInt(expectedAmountWei)) {
    return false
  }
  if (!envConfig.PLATFORM_WALLET_ADDRESS) return false
  return normalize(status.receiver) === normalize(envConfig.PLATFORM_WALLET_ADDRESS)
}

export function getDestinationTxHash(
  status: Awaited<ReturnType<typeof getBridgeStatus>>
) {
  if (status.status !== "COMPLETED" && status.status !== "PENDING") return null
  return (
    status.transactions?.find(
      (tx) => tx.chainId === AVALANCHE_USDC.chainId
    )?.transactionHash ?? null
  )
}
