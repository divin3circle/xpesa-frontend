"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"

import {
  TransactionManagementTable,
  type TransactionRecord,
} from "@/components/ui/transaction-management-table"
import {
  type PublicTransaction,
  useTransactionsByLinkId,
} from "@/hooks/use-transactions"
import { Skeleton } from "../ui/skeleton"

function shorten(value: string) {
  if (value.length <= 12) return value
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getExplorerTransactionUrl(network: string, txHash: string) {
  const normalized = network.toLowerCase()

  if (normalized === "hedera-mainnet") {
    return `https://hashscan.io/mainnet/transaction/${txHash}`
  }

  if (normalized === "hedera-testnet") {
    return `https://hashscan.io/testnet/transaction/${txHash}`
  }

  if (normalized.includes("polygon")) {
    return `https://polygonscan.com/tx/${txHash}`
  }

  if (normalized.includes("solana")) {
    return `https://solscan.io/tx/${txHash}`
  }

  return `https://hashscan.io/mainnet/transaction/${txHash}`
}

function toTransactionRecord(tx: PublicTransaction): TransactionRecord {
  return {
    hash: tx.tx_hash || shorten(tx.id),
    link: shorten(tx.link_id),
    wallet: shorten(tx.fan_wallet_address),
    amount: formatCurrency(tx.amount_usdc),
    date: new Date(tx.created_at).toLocaleString(),
    network: tx.network,
    token: "USDC",
    blockNumber: 0,
    gasFee: formatCurrency(tx.platform_fee_usdc),
    confirmations: tx.status === "confirmed" ? 12 : 0,
    status: tx.status,
    fromAddress: tx.fan_wallet_address,
    toAddress: tx.creator_id,
    explorerUrl: tx.tx_hash
      ? getExplorerTransactionUrl(tx.network, tx.tx_hash)
      : undefined,
  }
}

export function TxnsLoadingSkeleton() {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-4xl border border-border/70 bg-transparent p-4 md:flex-row md:items-center md:gap-0 md:p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-50" />
        <Skeleton className="h-3 w-75" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-50" />
        <Skeleton className="h-3 w-75" />
      </div>
    </div>
  )
}

export function PayLinkTransactions() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId

  const { data, isLoading } = useTransactionsByLinkId(linkId, 10)

  const transactions = useMemo(
    () => (data?.transactions ?? []).map((tx) => toTransactionRecord(tx)),
    [data?.transactions]
  )

  if (isLoading) {
    return (
      <>
        <TxnsLoadingSkeleton />
        <TxnsLoadingSkeleton />
        <TxnsLoadingSkeleton />
      </>
    )
  }

  const description = isLoading
    ? "Loading link transaction history..."
    : "Last transactions for this specific link"

  return (
    <TransactionManagementTable
      title="Link transactions"
      description={description}
      transactions={transactions}
      historyHref={`/pay/${linkId}/transactions`}
      className="border border-border/70 bg-card/25"
    />
  )
}
