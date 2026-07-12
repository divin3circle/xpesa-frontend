// components/payment/PayButton.tsx
"use client"

import { useRouter } from "next/navigation"
import {
  getContract,
  prepareContractCall,
  sendBatchTransaction,
} from "thirdweb"
import { isAddress } from "viem"
import { parseUnits } from "viem"
import { PAYMENT_CHAIN, USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"
import { PublicLinkDetails } from "@/app/api/public/links/route"
import { Account } from "thirdweb/wallets"
import { client, getErrorMessage } from "@/lib/utils"
import { usePublicCreatorHandleById } from "@/hooks/use-public"
import { toast } from "sonner"
import LoadingSpinner from "../ui/loading-spinner"
import { useMyBalance } from "@/hooks/use-balance"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { envConfig } from "@/lib/env"

export function PayButton({
  link,
  account,
  amount,
  isPaying,
  setIsPayingAction,
}: {
  link: PublicLinkDetails
  account: Account
  amount: number
  isPaying: boolean
  setIsPayingAction: (isPaying: boolean) => void
}) {
  const router = useRouter()
  const {
    data: creatorHandleData,
    isLoading,
    error: creatorHandleError,
  } = usePublicCreatorHandleById(link.creatorId)
  const {
    data: balance,
    isLoading: balanceIsLoading,
    error: balanceError,
  } = useMyBalance(account)

  const error = creatorHandleError

  const creatorWalletAddress = creatorHandleData?.creator.wallet_address ?? ""

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

  if (error || !creatorHandleData) {
    return (
      <button
        disabled
        className="w-full rounded-2xl bg-red-500 py-3 font-medium text-white"
      >
        Error loading creator profile
      </button>
    )
  }

  async function handlePay() {
    if (!account || amount <= 0) {
      toast.error("Enter a valid payment amount")
      return
    }

    const normalizedCreatorWallet = creatorWalletAddress.trim()
    const normalizedPlatformWallet = envConfig.PLATFORM_WALLET_ADDRESS.trim()

    if (!isAddress(normalizedCreatorWallet)) {
      toast.error("Creator wallet is unavailable")
      return
    }

    if (!isAddress(normalizedPlatformWallet)) {
      toast.error("Platform wallet is not configured correctly")
      return
    }

    const numericBalance = Number(String(balance ?? "0").replace(/,/g, ""))
    if (Number.isFinite(numericBalance) && numericBalance < amount) {
      toast.error("Insufficient USDC balance")
      return
    }

    setIsPayingAction(true)

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
        params: [
          normalizedCreatorWallet,
          parseUnits(creatorAmount.toFixed(6), 6),
        ],
      })

      const platformTx = prepareContractCall({
        contract: usdcContract,
        method: "function transfer(address to, uint256 amount) returns (bool)",
        params: [
          normalizedPlatformWallet,
          parseUnits(platformAmount.toFixed(6), 6),
        ],
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

      if (!res.ok) {
        toast.error("Payment confirmation failed")
        return
      }

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
          router.push(
            `/pay/${link.id}/thankyou?token=${accessToken}&txHash=${transactionHash}`
          )
          break
      }
    } catch (err) {
      console.error("Payment failed", err)
      toast.error("Payment failed. Please try again.", {
        description: getErrorMessage(err),
      })
    } finally {
      setIsPayingAction(false)
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            My balance:{" "}
            <span className="cursor-pointer font-semibold underline">
              {balanceIsLoading ? "*.**" : balanceError ? "*.**" : balance} USDC
            </span>
          </p>
          <span className="text-xs text-muted-foreground">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
            <HugeiconsIcon
              icon={Copy01Icon}
              className="ml-1 inline h-3 w-3 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(account.address)
                toast.success("Wallet address copied to clipboard")
              }}
            />
          </span>
        </div>
        <Link
          href="/buy"
          className="text-xs font-semibold text-muted-foreground underline"
        >
          Get USDC
        </Link>
      </div>
    </>
  )
}
