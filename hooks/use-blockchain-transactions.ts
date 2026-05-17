import { envConfig } from "@/lib/env"
import { useQuery } from "@tanstack/react-query"
import { ethers } from "ethers"

export interface TransactionResponse {
  tx: ethers.TransactionResponse | null
  error: Error | null
}

async function getTransactionDetails({
  txHash,
}: {
  txHash: string
}): Promise<TransactionResponse> {
  // Basic validation to avoid sending malformed hashes to the RPC node
  const hash = String(txHash ?? "").trim()
  const isValidHash = /^0x[0-9a-fA-F]{64}$/.test(hash)

  if (!isValidHash) {
    const err = new Error("Invalid transaction hash format")
    console.error("getTransactionDetails: invalid txHash", txHash)
    return { tx: null, error: err }
  }

  try {
    const provider = new ethers.JsonRpcProvider(envConfig.RPC_URL)

    const tx = await provider.getTransaction(hash)
    const receipt = await provider.getTransactionReceipt(hash)

    if (!tx || !receipt) {
      return { tx: null, error: new Error("Transaction not found") }
    }

    return { tx, error: null }
  } catch (error) {
    console.error("Error fetching transaction details:", error)
    return {
      tx: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    }
  }
}

export function useTransactionDetails(txHash: string) {
  const hash = String(txHash ?? "").trim()
  const isValidHash = /^0x[0-9a-fA-F]{64}$/.test(hash)

  return useQuery({
    queryKey: ["transactionDetails", hash],
    queryFn: () => getTransactionDetails({ txHash: hash }),
    enabled: Boolean(hash) && isValidHash,
  })
}
