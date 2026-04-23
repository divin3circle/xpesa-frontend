"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { CircleCheckBig, Copy, ExternalLink, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { supportedNetworks, supportedTokens } from "@/lib/dashboard"
import { cn } from "@/lib/utils"
import { More01Icon } from "hugeicons-react"

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

interface TransactionManagementTableProps {
  title?: string
  description?: string
  transactions?: TransactionRecord[]
  historyHref?: string
  className?: string
}

const networkLogoMap = new Map(
  supportedNetworks.map((network) => [network.name.toLowerCase(), network.icon])
)

const tokenLogoMap = new Map(
  supportedTokens.map((token) => [token.symbol.toLowerCase(), token.icon])
)

function getNetworkLogo(network: string) {
  return networkLogoMap.get(network.toLowerCase()) ?? null
}

function getTokenLogo(token: string) {
  return tokenLogoMap.get(token.toLowerCase()) ?? null
}

const defaultTransactions: TransactionRecord[] = [
  {
    hash: "0x9f...e2b",
    link: "React Native Crash Course",
    wallet: "0x4D2B...A91e",
    amount: "$12.00",
    date: "Today, 11:42",
    network: "Base",
    token: "USDC",
    blockNumber: 24561219,
    gasFee: "$0.03",
    confirmations: 48,
    status: "confirmed",
    fromAddress: "0x5A7B...F329",
    toAddress: "0x4D2B...A91e",
    explorerUrl: "https://basescan.org",
  },
  {
    hash: "0x7a...119",
    link: "Product Design Teardown",
    wallet: "0x91Aa...f2B0",
    amount: "$5.00",
    date: "Today, 09:18",
    network: "Polygon",
    token: "USDT",
    blockNumber: 61488221,
    gasFee: "$0.02",
    confirmations: 32,
    status: "confirmed",
    fromAddress: "0x2f11...9c66",
    toAddress: "0x91Aa...f2B0",
    explorerUrl: "https://polygonscan.com",
  },
]

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

function AssetLogoBadge({
  src,
  label,
  size = 20,
  className,
}: {
  src: string | null
  label: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full border border-border/60 bg-background",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
    >
      {src ? (
        <Image
          src={src}
          alt={label}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[10px] font-semibold text-muted-foreground">
          {label.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
  )
}

export function TransactionManagementTable({
  title = "Recent transactions",
  description = "Last 10 confirmed payments from your audience",
  transactions = defaultTransactions,
  historyHref = "/dashboard/wallet/history",
  className,
}: TransactionManagementTableProps) {
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const summary = useMemo(() => {
    const total = transactions.length
    const confirmed = transactions.filter(
      (item) => item.status === "confirmed"
    ).length
    return { total, confirmed }
  }, [transactions])

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
        <div className="text-xs text-muted-foreground">
          {summary.confirmed}/{summary.total} confirmed
        </div>
      </div>

      <div className="space-y-2">
        {transactions.map((tx, index) => (
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
                <p className="text-xs text-muted-foreground">
                  {tx.confirmations} confirmations
                </p>
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
      </div>

      <div className="mt-4">
        <Button variant="outline" asChild>
          <Link href={historyHref}>View More</Link>
        </Button>
      </div>

      <AnimatePresence>
        {selectedTx ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl rounded-3xl border border-border/70 bg-card p-5 shadow-2xl"
              initial={shouldReduceMotion ? false : { scale: 0.96, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { scale: 0.98, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AssetLogoBadge
                      src={getTokenLogo(selectedTx.token)}
                      label={selectedTx.token}
                      size={22}
                    />
                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                      Transaction details
                    </p>
                  </div>
                  <h3 className="font-heading text-2xl font-semibold tracking-tight">
                    {selectedTx.link}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTx.wallet} · {selectedTx.network}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedTx(null)}
                >
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
                      src={getTokenLogo(selectedTx.token)}
                      label={selectedTx.token}
                      size={18}
                    />
                    <p className="text-sm font-medium">
                      {selectedTx.amount} · {selectedTx.token}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Network
                  </p>
                  <div className="flex items-center gap-2">
                    <AssetLogoBadge
                      src={getNetworkLogo(selectedTx.network)}
                      label={selectedTx.network}
                      size={22}
                    />
                    <p className="font-medium">{selectedTx.network}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Block Number
                  </p>
                  <p className="font-medium">{selectedTx.blockNumber}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Gas Fee
                  </p>
                  <p className="font-medium">{selectedTx.gasFee}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Confirmations
                  </p>
                  <p className="font-medium">{selectedTx.confirmations}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/30 to-background p-3">
                  <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Status
                  </p>
                  <StatusBadge status={selectedTx.status} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (typeof navigator !== "undefined") {
                      void navigator.clipboard.writeText(selectedTx.hash)
                    }
                  }}
                >
                  <Copy className="size-4" />
                  Copy hash
                </Button>
                {selectedTx.explorerUrl ? (
                  <Button variant="secondary" size="sm" asChild>
                    <Link
                      href={selectedTx.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      Open block explorer
                    </Link>
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={() => setSelectedTx(null)}
                >
                  <CircleCheckBig className="size-4" />
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
