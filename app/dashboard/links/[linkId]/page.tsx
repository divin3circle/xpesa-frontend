"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"

import { LinkDashboardDetails } from "@/components/dashboard/links/link-dashboard-details"
import { LinkDashboardHeader } from "@/components/dashboard/links/link-dashboard-header"
import { LinkDashboardStats } from "@/components/dashboard/links/link-dashboard-stats"
import { LinkQuestPanel } from "@/components/dashboard/links/link-quest-panel"
import {
  LinkListMessage,
  LinkSkeleton,
} from "@/components/dashboard/links/link-list-states"
import {
  TransactionManagementTable,
  type TransactionRecord,
} from "@/components/ui/transaction-management-table"
import { useMyLinks } from "@/hooks/use-links"
import {
  type PublicTransaction,
  useTransactionsByLinkId,
} from "@/hooks/use-transactions"

function money(value: number | null | undefined) {
  return `${Number(value ?? 0).toFixed(2)} USDC`
}

function shorten(value: string) {
  if (value.length <= 12) return value
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function toTransactionRecord(tx: PublicTransaction): TransactionRecord {
  return {
    hash: tx.tx_hash || shorten(tx.id),
    link: shorten(tx.link_id),
    wallet: shorten(tx.fan_wallet_address),
    amount: money(tx.amount_usdc),
    date: new Date(tx.created_at).toLocaleString(),
    network: tx.network,
    token: "USDC",
    blockNumber: 0,
    gasFee: money(tx.platform_fee_usdc),
    confirmations: tx.status === "confirmed" ? 12 : 0,
    status: tx.status,
    fromAddress: tx.fan_wallet_address,
    toAddress: tx.creator_id,
  }
}

export default function LinkDashboardPage() {
  const params = useParams<{ linkId: string }>()
  const linkId = params.linkId
  const { data, isLoading, error } = useMyLinks()
  const { data: txData, isLoading: txLoading } = useTransactionsByLinkId(
    linkId,
    8
  )
  const link = useMemo(
    () => data?.links.find((item) => item.id === linkId) ?? null,
    [data?.links, linkId]
  )
  const tableTransactions = useMemo(
    () => (txData?.transactions ?? []).map(toTransactionRecord),
    [txData?.transactions]
  )

  if (isLoading) return <LinkSkeleton />
  if (error || !link)
    return <LinkListMessage danger>Could not load this link.</LinkListMessage>

  const transactionCount = txData?.transactions.length ?? 0
  const stats = [
    {
      label: "Views",
      value: String(link.view_count ?? 0),
      detail: "Public page visits",
    },
    {
      label: "Payments",
      value: String(link.payment_count ?? 0),
      detail: "Confirmed payments",
    },
    {
      label: "Revenue",
      value: money(link.total_earned_usdc),
      detail: "All-time earnings",
    },
    {
      label: "Recent txns",
      value: String(transactionCount),
      detail: "Latest activity",
    },
  ]

  return (
    <main className="space-y-6">
      <LinkDashboardHeader link={link} />

      <LinkDashboardStats stats={stats} />

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <LinkDashboardDetails link={link} />
        <LinkQuestPanel linkId={link.id} />
      </section>

      <section className="rounded-2xl border bg-background p-4">
        <h2 className="mb-3 font-heading text-xl font-semibold">
          Recent payments
        </h2>
        {txLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading transactions...
          </p>
        ) : (
          <TransactionManagementTable transactions={tableTransactions} />
        )}
      </section>
    </main>
  )
}
