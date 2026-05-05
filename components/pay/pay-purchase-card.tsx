/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useMemo, useState } from "react"
import { client, envConfig, getErrorMessage } from "@/lib/utils"
import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
} from "thirdweb/react"

import { PAYMENT_CHAIN } from "@/lib/thirdweb/chains"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { usePublicLink } from "@/hooks/use-public"
import Image from "next/image"
import { smartAccountConfig } from "@/lib/thirdweb/account-abstraction"
import { PayButton } from "./pay-button"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function formatUsdc(value: number | null) {
  if (!value || value <= 0) return "0.00"

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function PayPurchaseCard() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const [isPaying, setIsPaying] = useState(false)
  const [isSwitchingChain, setIsSwitchingChain] = useState(false)
  const [showChainSwitchDialog, setShowChainSwitchDialog] = useState(false)
  const { theme } = useTheme()

  const { data, isLoading, error } = usePublicLink(linkId)

  const [amount, setAmount] = useState("")
  const expectedChainId = Number(PAYMENT_CHAIN.id)
  const connectedChainId = wallet?.getChain()?.id
  const hasChainMismatch =
    Boolean(account) &&
    Boolean(wallet) &&
    connectedChainId !== undefined &&
    Number(connectedChainId) !== expectedChainId

  const link = data?.link

  const accessPills = useMemo(() => {
    if (!link) return []

    const pills: string[] = []
    if (link.access_wallet_binding) pills.push("Wallet-bound")
    if (link.access_expiry_type)
      pills.push(`Expiry: ${link.access_expiry_type}`)
    if (link.access_max_views) pills.push(`Max opens: ${link.access_max_views}`)
    return pills
  }, [link])

  useEffect(() => {
    if (!link) return
    if (amount) return
    setAmount(formatUsdc(link.suggested_amount_usdc ?? link.price_usdc))
  }, [amount, link])

  useEffect(() => {
    setShowChainSwitchDialog(hasChainMismatch)
  }, [hasChainMismatch])

  const handleSwitchNetwork = async () => {
    if (!wallet) return

    setIsSwitchingChain(true)
    try {
      await wallet.switchChain(PAYMENT_CHAIN)
      toast.success(`Switched to ${envConfig.PAYMENT_NETWORK_LABEL}`)
      setShowChainSwitchDialog(false)
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to switch network")
    } finally {
      setIsSwitchingChain(false)
    }
  }

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
          You will be able to view the content according to the access
          conditions set by the creator.
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
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            readOnly={link.type !== "tip"}
          />
        </div>
        <>
          {!account ? (
            <ConnectButton
              client={client}
              theme={theme === "dark" ? "dark" : "light"}
              chain={PAYMENT_CHAIN}
              accountAbstraction={smartAccountConfig}
              connectButton={{
                label: "Connect to Pay",
                style: {
                  backgroundColor: theme === "dark" ? "#fff" : "#000",
                  color: theme === "dark" ? "#000" : "#fff",
                  width: "100%",
                  marginBottom: "1rem",
                  borderRadius: "20px",
                },
              }}
              connectModal={{
                title: "Connect to pay",
                titleIcon: "/logo.png",
              }}
            />
          ) : hasChainMismatch ? (
            <div className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Your wallet is on the wrong network.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Switch to {envConfig.PAYMENT_NETWORK_LABEL} to continue with
                payment.
              </p>
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
            </div>
          ) : (
            <PayButton
              link={link}
              handle="sylus77"
              account={account}
              amount={(link.suggested_amount_usdc ?? link.price_usdc) || 1}
              isPaying={isPaying}
              setIsPaying={setIsPaying}
            />
          )}
          <h1 className="font-heading font-semibold text-muted-foreground">
            Supported Methods
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1">
              <Image src="/usdc.svg" alt="USDC" width={16} height={16} />
              <span className="text-sm font-semibold text-muted-foreground">
                USDC
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1">
              <Image src="/usdt.svg" alt="USDC" width={16} height={16} />
              <span className="text-sm font-semibold text-muted-foreground">
                USDT
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1">
              <Image
                src="/mpesa.png"
                alt="USDC"
                className="size-5 rounded"
                width={100}
                height={100}
              />
              <span className="text-sm font-semibold text-muted-foreground">
                Mobile
              </span>
            </div>
          </div>
        </>
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
