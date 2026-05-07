"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X, Copy, ExternalLink } from "lucide-react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { AssetLogoBadge } from "./transaction-management-table-utils"
import { useTransactionDetails } from "@/hooks/use-blockchain-transactions"
import { Skeleton } from "./skeleton"
import { toast } from "sonner"
import { getTokenLogo, getNetworkLogo } from "./transaction-management-table"
import { resolveExplorerUrl } from "@/lib/utils"
type MinimalTx = {
  hash: string
  link?: string
  token?: string
  network?: string
  amount?: string
  status?: "confirmed" | "pending" | "failed"
  explorerUrl?: string
}

function formatGasPrice(gasPrice: bigint | null | undefined) {
  if (gasPrice == null) {
    return "—"
  }

  const navax = ethers.formatUnits(gasPrice, "gwei")
  const [wholePart, fractionalPart = ""] = navax.split(".")

  if (wholePart !== "0" || fractionalPart.length === 0) {
    return `${navax} nAVAX (${gasPrice.toString()} wei)`
  }

  const leadingZeros = fractionalPart.match(/^0+/)?.[0].length ?? 0
  const significantPart = fractionalPart.slice(leadingZeros)

  if (leadingZeros === 0 || significantPart.length === 0) {
    return `${navax} nAVAX (${gasPrice.toString()} wei)`
  }

  return (
    <>
      0.0
      <sub className="align-baseline text-[0.72em] leading-none">
        {leadingZeros}
      </sub>
      {significantPart} nAVAX ({gasPrice.toString()} wei)
    </>
  )
}

export default function TransactionDetailsModal({
  tx,
  onCloseAction,
}: {
  tx: MinimalTx | null
  onCloseAction: () => void
}) {
  const shouldReduceMotion = useReducedMotion()
  const { data, isLoading, isError } = useTransactionDetails(tx?.hash ?? "")

  return (
    <AnimatePresence>
      {tx ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : isError ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
              <p className="text-xs font-semibold">
                Failed to load transaction details. Please try again later.
              </p>
              <Button variant="outline" onClick={onCloseAction}>
                Close
              </Button>
            </div>
          ) : !data || !data.tx ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-muted/10 p-6">
              <p className="text-sm font-medium">Transaction not found</p>
              <p className="text-xs text-muted-foreground">
                This transaction could not be found on the connected RPC node.
              </p>
              <Button variant="outline" onClick={onCloseAction}>
                Close
              </Button>
            </div>
          ) : (
            <motion.div
              className="w-full max-w-2xl rounded-3xl border border-border/70 p-5 shadow-2xl"
              initial={shouldReduceMotion ? false : { scale: 0.96, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { scale: 0.98, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AssetLogoBadge
                      src={getTokenLogo(tx?.token ?? "")}
                      label={tx?.token ?? ""}
                      size={22}
                    />
                    <p className="font-semibold">Transaction details</p>
                  </div>
                  <h3 className="font-heading text-2xl font-semibold tracking-tight">
                    {tx?.link}
                  </h3>
                  <p className="text-sm">
                    {tx?.amount} ·{" "}
                    <span className="font-semibold text-orange-500 underline">
                      {tx?.network}
                    </span>
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={onCloseAction}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Amount
                  </p>
                  <div className="flex items-center gap-2">
                    <AssetLogoBadge
                      src={getTokenLogo(tx?.token ?? "")}
                      label={tx?.token ?? ""}
                      size={18}
                    />
                    <p className="text-sm font-medium">
                      {tx?.amount} · {tx?.token}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Network
                  </p>
                  <div className="flex items-center gap-2">
                    <AssetLogoBadge
                      src={getNetworkLogo(tx?.network ?? "")}
                      label={tx?.network ?? ""}
                      size={22}
                    />
                    <p className="font-medium">{tx?.network}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Block Number
                  </p>
                  <p className="font-medium">
                    {data.tx.blockNumber?.toLocaleString() ?? "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Gas Fee
                  </p>
                  <p className="font-medium">
                    {formatGasPrice(data.tx.gasPrice)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Nonce
                  </p>
                  <p className="font-medium">{data.tx.nonce}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Status
                  </p>
                  <div className="inline-block">{tx?.status}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (typeof navigator !== "undefined")
                      void navigator.clipboard.writeText(tx?.hash ?? "")
                    toast.success("Transaction hash copied to clipboard!")
                  }}
                >
                  <Copy className="size-4" />
                  Copy hash
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const url = resolveExplorerUrl(tx?.hash ?? "")
                    if (typeof window !== "undefined") {
                      window.open(url, "_blank")
                    }
                  }}
                >
                  <ExternalLink className="size-4" />
                  Open block explorer
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
