"use client"

import { useMemo, useState } from "react"
import type { Account } from "thirdweb/wallets"

import type { PublicLinkDetails } from "@/app/api/public/links/route"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useMultichainBalances } from "./use-multichain-balances"
import { useMultichainPayment } from "./use-multichain-payment"
import type { TokenBalance } from "./types"

export function MultichainPaymentDialog({
  open,
  onOpenChange,
  link,
  account,
  amount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: PublicLinkDetails
  account?: Account
  amount: number
}) {
  const [selected, setSelected] = useState<TokenBalance | null>(null)
  const [isPaying, setIsPaying] = useState(false)
  const balances = useMultichainBalances(account)
  const checkout = useMultichainPayment({ link, account, amount })
  const options = balances.data ?? []
  const payable = useMemo(
    () => options.filter((item) => item.balanceNumber >= amount),
    [amount, options]
  )

  async function handlePay() {
    const source = selected ?? payable[0]
    if (!source) return
    setIsPaying(true)
    await checkout.pay(source)
    setIsPaying(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay from another chain</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {balances.isLoading ? (
            <div className="flex items-center gap-2 text-sm">
              <LoadingSpinner size={4} /> Checking supported chains...
            </div>
          ) : null}
          {options.map((item) => {
            const disabled = item.balanceNumber < amount || isPaying
            const active =
              (selected ?? payable[0])?.token.chainId === item.token.chainId
            return (
              <button
                key={item.token.chainId}
                type="button"
                disabled={disabled}
                onClick={() => setSelected(item)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm ${
                  active ? "border-primary bg-primary/5" : "border-border"
                } disabled:opacity-50`}
              >
                <span>{item.token.chainName}</span>
                <span>{Number(item.balance).toFixed(2)} USDC</span>
              </button>
            )
          })}
          {!balances.isLoading && payable.length === 0 ? (
            <p className="rounded-xl border p-3 text-sm text-muted-foreground">
              No supported USDC balance found for this payment.
            </p>
          ) : null}
          <Button
            type="button"
            className="w-full"
            disabled={!account || payable.length === 0 || isPaying}
            onClick={handlePay}
          >
            {isPaying ? "Processing bridge..." : `Pay ${amount} USDC`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
