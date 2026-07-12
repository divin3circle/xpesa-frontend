"use client"

import { useMemo, useState } from "react"
import { envConfig } from "@/lib/env"
import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { usePublicLink } from "@/hooks/use-public"
import { useTheme } from "@/components/theme-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePaymentChainGuard } from "@/hooks/use-payment-chain-guard"
import { usePaymentAmount } from "@/hooks/use-payment-amount"
import type { PayMethodOption } from "./payment-methods-badges"
import { FreeAccessButton } from "./free-access-button"
import { PaidCheckoutActions } from "./paid-checkout-actions"

export function PayPurchaseCard() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId
  const [isPaying, setIsPaying] = useState(false)
  const [checkoutMethod, setCheckoutMethod] = useState<PayMethodOption>("usdc")
  const { theme } = useTheme()
  const {
    account,
    connectedChainLabel,
    hasChainMismatch,
    isSwitchingChain,
    showChainSwitchDialog,
    setShowChainSwitchDialog,
    openChainSwitchDialog,
    handleSwitchNetwork,
  } = usePaymentChainGuard()

  const { data, isLoading, error } = usePublicLink(linkId)

  const link = data?.link
  const { displayAmount, setAmount } = usePaymentAmount(link)
  const paymentAmount = Number(displayAmount)
  const safePaymentAmount = Number.isFinite(paymentAmount) ? paymentAmount : 0
  const isFreeAccess = safePaymentAmount <= 0

  const accessPills = useMemo(() => {
    if (!link) return []

    const pills: string[] = []
    if (link.access_wallet_binding) pills.push("Wallet-bound")
    if (link.access_expiry_type)
      pills.push(`Expiry: ${link.access_expiry_type}`)
    if (link.access_max_views) pills.push(`Max opens: ${link.access_max_views}`)
    return pills
  }, [link])

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col justify-between gap-2 md:flex-row md:items-center">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !link) {
    return (
      <Card className="border-border/70">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Could not load payment details.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-xl">Purchase Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Viewing content according to the access conditions set by the creator.
        </p>

        {accessPills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {accessPills.map((pill) => (
              <Badge key={pill} variant="secondary">
                {pill}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="amount" className="mb-1 text-sm font-medium">
            Amount (USDC)
          </label>
          <Input
            id="amount"
            value={displayAmount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            readOnly={link.type !== "tip"}
          />
        </div>
        {isFreeAccess ? (
          <FreeAccessButton link={link} />
        ) : (
          <PaidCheckoutActions
            link={link}
            account={account ?? undefined}
            amount={safePaymentAmount}
            theme={theme}
            selectedMethod={checkoutMethod}
            onSelectMethod={setCheckoutMethod}
            isPaying={isPaying}
            setIsPaying={setIsPaying}
            hasChainMismatch={hasChainMismatch}
            connectedChainLabel={connectedChainLabel}
            onOpenChainSwitchDialog={openChainSwitchDialog}
            onSwitchNetwork={handleSwitchNetwork}
            isSwitchingChain={isSwitchingChain}
          />
        )}
      </CardContent>
      <Dialog
        open={showChainSwitchDialog}
        onOpenChange={setShowChainSwitchDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Network to Continue</DialogTitle>
            <DialogDescription>
              Payments for this link are processed on{" "}
              {envConfig.PAYMENT_NETWORK_LABEL}. Please switch your wallet
              network to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleSwitchNetwork}
              disabled={isSwitchingChain}
              className="w-full"
            >
              {isSwitchingChain
                ? "Switching network..."
                : `Switch to ${envConfig.PAYMENT_NETWORK_LABEL}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
