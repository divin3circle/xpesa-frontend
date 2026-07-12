import { Bridge } from "thirdweb"

import { envConfig } from "@/lib/env"
import { client } from "@/lib/utils"
import { AVALANCHE_USDC, findMultichainToken } from "./config"
import type { MultichainQuoteRequest } from "./schema"

export type SerializedBridgeTransaction = {
  id: string
  action: string
  to: string
  data: string
  value: string
  chainId: number
}

export type SerializedBridgeRoute = {
  originAmountWei: string
  destinationAmountWei: string
  estimatedExecutionTimeMs: number | null
  expiration: number | null
  transactions: SerializedBridgeTransaction[]
}

export async function prepareMultichainBridgeQuote(
  input: MultichainQuoteRequest
) {
  const source = findMultichainToken(input.sourceChainId)
  if (!source) throw new Error("Unsupported source chain")

  const route = await Bridge.Buy.prepare({
    originChainId: source.chainId,
    originTokenAddress: source.tokenAddress,
    destinationChainId: AVALANCHE_USDC.chainId,
    destinationTokenAddress: AVALANCHE_USDC.tokenAddress,
    amount: BigInt(Math.round(input.amountUsdc * 1_000_000)),
    sender: input.payerWalletAddress as `0x${string}`,
    receiver: envConfig.PLATFORM_WALLET_ADDRESS as `0x${string}`,
    maxSteps: 3,
    purchaseData: {
      reference: input.linkId,
      metadata: { product: "xpesa-multichain-payment" },
    },
    client,
  })

  return serializeBridgeRoute(route)
}

export function serializeBridgeRoute(route: {
  originAmount: bigint
  destinationAmount: bigint
  estimatedExecutionTimeMs?: number
  expiration?: number
  steps: {
    transactions: {
      id: string
      action: string
      to: string
      data: string
      value?: bigint
      chainId: number
    }[]
  }[]
}): SerializedBridgeRoute {
  return {
    originAmountWei: route.originAmount.toString(),
    destinationAmountWei: route.destinationAmount.toString(),
    estimatedExecutionTimeMs: route.estimatedExecutionTimeMs ?? null,
    expiration: route.expiration ?? null,
    transactions: route.steps.flatMap((step) =>
      step.transactions.map((tx) => ({
        id: tx.id,
        action: tx.action,
        to: tx.to,
        data: tx.data,
        value: (tx.value ?? BigInt(0)).toString(),
        chainId: tx.chainId,
      }))
    ),
  }
}
