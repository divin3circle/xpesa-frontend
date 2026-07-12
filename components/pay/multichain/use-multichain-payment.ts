import { useRouter } from "next/navigation"
import { defineChain, prepareTransaction, sendAndConfirmTransaction } from "thirdweb"
import type { Account } from "thirdweb/wallets"
import { toast } from "sonner"

import type { PublicLinkDetails } from "@/app/api/public/links/route"
import { client, getErrorMessage } from "@/lib/utils"
import {
  createBridgeIntent,
  fetchBridgeQuote,
  settleBridgeIntent,
  updateBridgeStatus,
} from "./api"
import type { BridgeTransaction, TokenBalance } from "./types"

async function waitForBridgeCompletion(input: {
  intentId: string
  tx: BridgeTransaction
  txHash: string
}) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const status = await updateBridgeStatus({
      intentId: input.intentId,
      originTxHash: input.txHash,
      originChainId: input.tx.chainId,
      transactionId: input.tx.id,
    })
    if (status.isComplete) return
    if (status.status === "FAILED") throw new Error("Bridge transaction failed")
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
  throw new Error("Bridge is still processing. Please try again shortly.")
}

export function useMultichainPayment({
  link,
  account,
  amount,
}: {
  link: PublicLinkDetails
  account?: Account
  amount: number
}) {
  const router = useRouter()

  async function pay(source: TokenBalance) {
    if (!account) throw new Error("Connect your wallet first")
    const route = await fetchBridgeQuote({
      linkId: link.id,
      amountUsdc: amount,
      payerWalletAddress: account.address,
      sourceChainId: source.token.chainId,
      sourceTokenAddress: source.token.tokenAddress,
    })
    const intent = await createBridgeIntent({
      linkId: link.id,
      amountUsdc: amount,
      payerWalletAddress: account.address,
      sourceChainId: source.token.chainId,
      sourceTokenAddress: source.token.tokenAddress,
      originAmountWei: route.originAmountWei,
      destinationAmountWei: route.destinationAmountWei,
      route,
    })

    for (const tx of route.transactions) {
      const receipt = await sendAndConfirmTransaction({
        account,
        transaction: prepareTransaction({
          client,
          chain: defineChain(tx.chainId),
          to: tx.to,
          data: tx.data,
          value: BigInt(tx.value || "0"),
        }),
      })
      if (tx.action !== "approval") {
        await waitForBridgeCompletion({
          intentId: intent.id,
          tx,
          txHash: receipt.transactionHash,
        })
      }
    }

    const access = await settleBridgeIntent(intent.id)
    toast.success("Payment confirmed")
    if (access.linkType === "gate") {
      const urlRes = await fetch(`/api/payments/access/${access.accessToken}`)
      window.location.href = (await urlRes.json()).destinationUrl
      return
    }
    router.push(
      access.linkType === "tip"
        ? `/pay/${link.id}/thankyou?token=${access.accessToken}`
        : `/view/${access.accessToken}`
    )
  }

  return {
    pay: (source: TokenBalance) =>
      pay(source).catch((error) => {
        toast.error("Multichain payment failed", {
          description: getErrorMessage(error),
        })
      }),
  }
}
