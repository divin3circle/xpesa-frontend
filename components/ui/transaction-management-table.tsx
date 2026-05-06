"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { supportedNetworks, supportedTokens } from "@/lib/dashboard"
import { cn } from "@/lib/utils"
import { More01Icon } from "hugeicons-react"
import TransactionDetailsModal from "@/components/ui/transaction-details-modal"
import { AssetLogoBadge } from "./transaction-management-table-utils"
import { TxnsLoadingSkeleton } from "@/components/pay/pay-link-transactions"

export interface TransactionRecord {
  hash: string
  link: string
  wallet: string
  amount: string
  date: string
  network: string
  token: string
  blockNumber: number
  gasFee: string
  confirmations: number
  status: "confirmed" | "pending" | "failed"
  fromAddress?: string
  toAddress?: string
  explorerUrl?: string
}

interface TransactionManagementTableProps<Transactions> {
  title?: string
  description?: string
  transactions?: Transactions[]
  historyHref?: string
  className?: string
  isLoading?: boolean
}

const networkLogoMap = new Map(
  supportedNetworks.map((network) => [network.name.toLowerCase(), network.icon])
)

const tokenLogoMap = new Map(
  supportedTokens.map((token) => [token.symbol.toLowerCase(), token.icon])
)

export function getNetworkLogo(network: string) {
  return networkLogoMap.get(network.toLowerCase()) ?? null
}

export function getTokenLogo(token: string) {
  return tokenLogoMap.get(token.toLowerCase()) ?? null
}

function StatusBadge({ status }: { status: TransactionRecord["status"] }) {
  const styles =
    status === "confirmed"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
      : status === "pending"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
        : "border-red-500/30 bg-red-500/10 text-red-500"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        styles
      )}
    >
      {status}
    </span>
  )
}

export function TransactionManagementTable<
  Transactions extends TransactionRecord,
>({
  title = "Recent transactions",
  description = "Showing confirmed transactions",
  transactions = [],
  historyHref = "/dashboard/wallet/history",
  className,
  isLoading,
}: TransactionManagementTableProps<Transactions>) {
  const [selectedTx, setSelectedTx] = useState<Transactions | null>(null)
  const shouldReduceMotion = useReducedMotion()

  if (isLoading) {
    return (
      <>
        <TxnsLoadingSkeleton />
        <TxnsLoadingSkeleton />
        <TxnsLoadingSkeleton />
      </>
    )
  }

  return (
    <div
      className={cn(
        "rounded-4xl border border-none bg-transparent p-4 md:p-6",
        className
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {transactions.length !== 0 &&
          transactions.map((tx, index) => (
            <motion.div
              key={tx.hash}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="grid gap-3 rounded-2xl border border-border/70 bg-transparent p-3 md:grid-cols-[minmax(0,2.2fr)_minmax(110px,1fr)_minmax(88px,auto)_minmax(110px,0.95fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate leading-tight font-medium">{tx.link}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {tx.wallet}
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <div className="min-w-0">
                  <AssetLogoBadge
                    src={getTokenLogo(tx.token)}
                    label={tx.token}
                    size={22}
                  />
                  <p className="truncate text-sm leading-tight font-medium">
                    {tx.amount}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tx.token}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 md:justify-center">
                <AssetLogoBadge
                  src={getNetworkLogo(tx.network)}
                  label={tx.network}
                  size={24}
                  className="border-none bg-transparent shadow-none"
                />
                <span className="font-heading text-xs text-muted-foreground">
                  {tx.network}
                </span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{tx.date}</p>
                </div>
                <StatusBadge status={tx.status} />
              </div>
              <div className="md:text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedTx(tx)}
                  className="text-muted-foreground underline"
                >
                  <More01Icon />
                </Button>
              </div>
            </motion.div>
          ))}

        {transactions.length === 0 && (
          <div className="flex w-full flex-col items-center justify-center p-2">
            <p className="text-xs font-semibold text-muted-foreground">
              No transactions to show.
            </p>
          </div>
        )}
      </div>
      {transactions.length !== 0 && (
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href={historyHref}>View More</Link>
          </Button>
        </div>
      )}

      {selectedTx ? (
        <TransactionDetailsModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      ) : null}
    </div>
  )
}
