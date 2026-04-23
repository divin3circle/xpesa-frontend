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
      ? `https://basescan.org/tx/${tx.tx_hash}`
      : undefined,
  }
}

export function PayLinkTransactions() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId

  const { data, isLoading } = useTransactionsByLinkId(linkId, 10)

  const transactions = useMemo(
    () => (data?.transactions ?? []).map((tx) => toTransactionRecord(tx)),
    [data?.transactions]
  )

  const description = isLoading
    ? "Loading link transaction history..."
    : "Last transactions for this specific link"

  return (
    <TransactionManagementTable
      title="Link transactions"
      description={description}
      transactions={transactions}
      historyHref="/dashboard/wallet/history"
      className="border border-border/70 bg-card/25"
    />
  )
}
