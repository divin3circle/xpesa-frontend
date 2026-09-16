"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

import { EmptyState } from "./history/empty-state"
import { HistoryDetailOverlay } from "./history/history-detail-overlay"
import { HistoryHeader } from "./history/history-header"
import { HistoryRow } from "./history/history-row"
import { WithdrawHistorySkeleton } from "./history/history-skeleton"
import { useRecentWithdrawals } from "./history/use-recent-withdrawals"
import { type WithdrawalRecord } from "./history/utils"

export type { WithdrawalRecord } from "./history/utils"

interface WithdrawHistoryProps {
  title?: string
  description?: string
  className?: string
}

export default function WithdrawHistory({
  title = "Recent withdrawals",
  description = "Latest withdrawal requests status.",
  className,
}: WithdrawHistoryProps) {
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRecord | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const { withdrawals, isLoading, error } = useRecentWithdrawals()

  const summary = useMemo(() => {
    const completed = withdrawals.filter(
      (withdrawal) => withdrawal.status.toLowerCase() === "completed"
    ).length
    const pending = withdrawals.filter((withdrawal) =>
      ["pending", "processing"].includes(withdrawal.status.toLowerCase())
    ).length

    return { completed, pending }
  }, [withdrawals])

  if (isLoading) {
    return <WithdrawHistorySkeleton />
  }

  return (
    <section className={cn("mt-8 w-full", className)}>
      <div className="relative overflow-hidden">
        <HistoryHeader
          title={title}
          description={description}
          summary={summary}
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        ) : null}

        <div className="hidden grid-cols-12 gap-4 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase md:grid">
          <div className="col-span-3">Amount</div>
          <div className="col-span-2">Method</div>
          <div className="col-span-2">Requested</div>
          <div className="col-span-2">Reference</div>
          <div className="col-span-2">Completed</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        <motion.div
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.05,
              },
            },
          }}
        >
          {withdrawals.length > 0 ? (
            withdrawals.map((withdrawal) => (
              <HistoryRow
                key={withdrawal.id}
                withdrawal={withdrawal}
                shouldReduceMotion={shouldReduceMotion}
                onSelect={setSelectedWithdrawal}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </motion.div>

        <AnimatePresence>
          {selectedWithdrawal ? (
            <HistoryDetailOverlay
              withdrawal={selectedWithdrawal}
              shouldReduceMotion={shouldReduceMotion}
              onClose={() => setSelectedWithdrawal(null)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  )
}
