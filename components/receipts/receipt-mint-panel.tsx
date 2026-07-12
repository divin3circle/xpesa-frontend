"use client"

import { useState } from "react"
import { useActiveAccount } from "thirdweb/react"
import { Award } from "lucide-react"

import { FanWalletConnectModal } from "@/components/fan-wallet-connect-modal"
import { useFanWalletContext } from "@/components/fan-wallet-context"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ReceiptMintButton } from "./receipt-mint-button"
import { ReceiptMintedState } from "./receipt-minted-state"
import { useReceiptMint } from "./use-receipt-mint"

export function ReceiptMintPanel({
  accessToken,
  requiredWalletAddress,
}: {
  accessToken?: string | null
  requiredWalletAddress?: string | null
}) {
  const [showConnect, setShowConnect] = useState(false)
  const activeAccount = useActiveAccount()
  const { fanSmartAccountAddress } = useFanWalletContext()
  const isFreeAccess = requiredWalletAddress?.startsWith("free:")
  const isMobileAccess = requiredWalletAddress?.startsWith("kotani:")
  const connectedSmartAccount = fanSmartAccountAddress || ""
  const requiredWallet = isMobileAccess ? "" : requiredWalletAddress || ""
  const hasMatchingSmartAccount =
    !requiredWallet ||
    connectedSmartAccount.toLowerCase() === requiredWallet.toLowerCase()
  const recipient =
    connectedSmartAccount && hasMatchingSmartAccount
      ? connectedSmartAccount
      : isMobileAccess
        ? activeAccount?.address || ""
        : ""
  const { receipt, isLoading, isMinting, mint } = useReceiptMint(accessToken)

  if (!accessToken || isFreeAccess) return null
  if (isLoading) return <Skeleton className="h-36 w-full rounded-xl" />
  if (receipt?.status === "minted") return <ReceiptMintedState receipt={receipt} />

  return (
    <section className="rounded-xl border border-border/70 bg-background p-4">
      <FanWalletConnectModal
        isOpen={showConnect}
        onCloseAction={() => setShowConnect(false)}
      />
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Award className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Supporter receipt NFT</p>
          <p className="text-xs text-muted-foreground">
            Optional public Avalanche receipt for this payment.
          </p>
        </div>
      </div>
      {recipient ? (
        <ReceiptMintButton
          disabled={receipt?.status === "minting"}
          isMinting={isMinting}
          onMint={() => void mint(recipient)}
        />
      ) : (
        <Button onClick={() => setShowConnect(true)} className="w-full">
          Connect paying wallet to mint receipt
        </Button>
      )}
      {connectedSmartAccount && !hasMatchingSmartAccount ? (
        <p className="mt-3 text-xs text-destructive">
          This receipt must be minted to the smart account that paid for access.
        </p>
      ) : null}
      {receipt?.status === "failed" && receipt.failure_message ? (
        <p className="mt-3 text-xs text-destructive">{receipt.failure_message}</p>
      ) : null}
    </section>
  )
}
