"use client"

import { useState } from "react"
import type { Account } from "thirdweb/wallets"

import type { PublicLinkDetails } from "@/app/api/public/links/route"
import { Button } from "@/components/ui/button"
import { ConnectToPayButton } from "./connect-to-pay-button"
import { MultichainPaymentDialog } from "./multichain/multichain-payment-dialog"

export function MultichainPayButton({
  link,
  account,
  amount,
  theme,
}: {
  link: PublicLinkDetails
  account?: Account
  amount: number
  theme?: string
}) {
  const [open, setOpen] = useState(false)

  if (!account) return <ConnectToPayButton theme={theme} />

  return (
    <>
      <Button
        type="button"
        className="h-12 w-full rounded-2xl"
        onClick={() => setOpen(true)}
      >
        Pay from another chain
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        Pay from another chain using Multi-chain. Your USDC will be bridged to
        Avalanche payment completed automatically.
      </p>
      <MultichainPaymentDialog
        open={open}
        onOpenChange={setOpen}
        link={link}
        account={account}
        amount={amount}
      />
    </>
  )
}
