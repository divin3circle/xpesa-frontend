"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import type { PublicTransaction } from "@/app/api/public/transactions/route"
import { getNetworkLogo } from "./transaction-management-table"
import Image from "next/image"
import Link from "next/link"

interface CreatorTransactionsTableProps {
  title?: string
  transactions?: PublicTransaction[]
  onTransactionSelect?: (txId: string) => void
  className?: string
  isLoading?: boolean
}

export function CreatorTransactionsTable({
  title = "Transactions",
  transactions = [],
  onTransactionSelect,
  className = "",
  isLoading = false,
}: CreatorTransactionsTableProps) {
  const [selectedTx, setSelectedTx] = useState<string | null>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const handleTransactionSelect = (txId: string) => {
    setSelectedTx(txId)
    if (onTransactionSelect) {
      onTransactionSelect(txId)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<
      string,
      { bg: string; border: string; text: string }
    > = {
      confirmed: {
        bg: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
        border: isDark ? "border-emerald-500/30" : "border-emerald-200",
        text: isDark ? "text-emerald-400" : "text-emerald-600",
      },
      pending: {
        bg: isDark ? "bg-amber-500/10" : "bg-amber-50",
        border: isDark ? "border-amber-500/30" : "border-amber-200",
        text: isDark ? "text-amber-400" : "text-amber-600",
      },
      failed: {
        bg: isDark ? "bg-red-500/10" : "bg-red-50",
        border: isDark ? "border-red-500/30" : "border-red-200",
        text: isDark ? "text-red-400" : "text-red-600",
      },
    }

    return (
      colorMap[status] || {
        bg: "bg-gray-500/10",
        border: "border-gray-500/30",
        text: "text-gray-400",
      }
    )
  }

  const shorten = (address: string, start = 6, end = 4) => {
    if (address.length <= start + end) return address
    return `${address.slice(0, start)}...${address.slice(-end)}`
  }

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  }

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
  }

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/30" />
        ))}
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <div className="mt-2 mb-4">
          <h3 className="font-heading text-xl font-semibold tracking-tight">
            {title}
          </h3>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-background">
        <div className="overflow-x-auto">
          <div className="min-w-200">
            <div
              className="border-b border-border/20 bg-muted/15 px-6 py-3 text-xs font-medium tracking-wide text-muted-foreground/70 uppercase"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 65px 85px 140px 110px 120px",
                columnGap: "28px",
                alignItems: "center",
              }}
            >
              <div>Details</div>
              <div style={{ textAlign: "right" }}>Amount</div>
              <div style={{ textAlign: "center" }}>Network</div>
              <div>Date</div>
              <div style={{ textAlign: "right" }}>Earned</div>
              <div style={{ textAlign: "center" }}>Status</div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const status = getStatusColor(tx.status)
                  const isObject = typeof status === "object"

                  return (
                    <motion.div key={tx.id} variants={rowVariants}>
                      <div
                        className={`group relative cursor-pointer px-6 py-4 transition-all duration-200 ${
                          selectedTx === tx.id
                            ? "border-b border-border/30 bg-muted/50"
                            : "border-b border-border/20 hover:bg-muted/30"
                        }`}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "2fr 65px 85px 140px 110px 120px",
                          columnGap: "28px",
                          alignItems: "center",
                        }}
                        onClick={() => handleTransactionSelect(tx.id)}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground/90">
                            {shorten(tx.link_id, 10, 10)}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground/60">
                            {shorten(tx.fan_wallet_address, 6, 4)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-foreground/90">
                            {formatCurrency(tx.amount_usdc)}
                          </p>
                        </div>

                        <div className="flex justify-center">
                          <Image
                            src={getNetworkLogo(tx.network)}
                            alt={tx.network}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-medium text-foreground/90">
                            {formatDate(tx.created_at)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatTime(tx.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-500 dark:text-emerald-400">
                            {formatCurrency(tx.creator_net_usdc)}
                          </p>
                        </div>

                        <div className="flex justify-center">
                          {isObject && (
                            <span
                              className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${status.bg} ${status.border} ${status.text}`}
                            >
                              {tx.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No transactions yet
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Link
        href="/dashboard/transactions"
        className="mt-4 block text-right text-sm text-muted-foreground underline"
      >
        View full history
      </Link>
    </div>
  )
}
