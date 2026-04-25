// components/payment/PayButton.tsx
"use client"

import { useRouter } from "next/navigation"
import {
  getContract,
  prepareContractCall,
  sendBatchTransaction,
} from "thirdweb"
import { parseUnits } from "viem"
import { PAYMENT_CHAIN, USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"
import { PublicLinkDetails } from "@/app/api/public/links/route"
import { Account } from "thirdweb/wallets"
import { client } from "@/lib/utils"
import { usePublicCreator } from "@/hooks/use-public"
import { toast } from "sonner"
import LoadingSpinner from "../ui/loading-spinner"
import { useMyBalance } from "@/hooks/use-balance"

const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS!

export function PayButton({
  link,
  handle,
  account,
  amount,
  isPaying,
  setIsPaying,
}: {
  link: PublicLinkDetails
  handle: string
  account: Account
  amount: number
  isPaying: boolean
  setIsPaying: (isPaying: boolean) => void
}) {
  const router = useRouter()
  const { data, isLoading, error } = usePublicCreator(handle)
  const { data:balance, isLoading:balanceIsLoading, error:balanceError } = useMyBalance(account)

  const creatorWalletAddress = data?.creator.wallet_address ?? ""

  if (isLoading) {
    return (
      <button
        disabled
        className="flex w-full items-center justify-center rounded-2xl bg-primary/50 py-3 font-medium text-primary-foreground"
      >
        <LoadingSpinner />
      </button>
    )
  }

  if (error || !data) {
    return (
      <button
        disabled
        className="w-full rounded-2xl bg-red-500 py-3 font-medium text-white"
      >
        Error loading creator
      </button>
    )
  }

  async function handlePay() {
    if (!account || amount <= 0) return
    setIsPaying(true)

    try {
      const PLATFORM_FEE = 0.05
      const creatorAmount = amount * (1 - PLATFORM_FEE)
      const platformAmount = amount * PLATFORM_FEE

      const usdcContract = getContract({
        client: client,
        chain: PAYMENT_CHAIN,
        address:
          USDC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000068cda",
      })

      const creatorTx = prepareContractCall({
        contract: usdcContract,
        method: "function transfer(address to, uint256 amount) returns (bool)",
        params: [creatorWalletAddress, parseUnits(creatorAmount.toFixed(6), 6)],
      })

      const platformTx = prepareContractCall({
        contract: usdcContract,
        method: "function transfer(address to, uint256 amount) returns (bool)",
        params: [PLATFORM_WALLET, parseUnits(platformAmount.toFixed(6), 6)],
      })

      const { transactionHash } = await sendBatchTransaction({
        transactions: [creatorTx, platformTx],
        account,
      })

      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: transactionHash,
          linkId: link.id,
          fanWalletAddress: account.address,
          amountPaid: amount,
        }),
      })

      if (!res.ok) throw new Error("Payment confirmation failed")

      const { accessToken, linkType } = await res.json()

      switch (linkType) {
        case "gate":
          const urlRes = await fetch(`/api/payments/access/${accessToken}`)
          const { destinationUrl } = await urlRes.json()
          window.location.href = destinationUrl
          break
        case "document":
          router.push(`/view/${accessToken}`)
          break
        case "pack":
          router.push(`/view/${accessToken}`)
          break
        case "tip":
          router.push(`/pay/${link.id}/thankyou?token=${accessToken}`)
          break
      }
    } catch (err) {
      console.error(err)
      toast.error("Payment failed. Please try again.", {
        description: (err as Error).message,
      })
    } finally {
      setIsPaying(false)
    }
  }

  return (
   <>
    <button
      onClick={handlePay}
      disabled={isPaying || amount <= 0}
      className="w-full rounded-2xl bg-primary py-3 font-medium text-primary-foreground disabled:opacity-50"
    >
      {isPaying ? "Processing..." : `Pay ${amount} USDC`}
    </button>
    <p className="text-xs text-muted-foreground">My balance:{" "}
      <span className="underline font-semibold cursor-pointer">{balanceIsLoading ? "*.**" : balanceError ? balance : balance} USDC</span>
       </p>
   </>
  )
}
