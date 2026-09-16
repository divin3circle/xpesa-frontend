"use client"

import { motion } from "framer-motion"
import { Phone } from "lucide-react"

import { cn } from "@/lib/utils"

import { StatusBadge } from "./status-badge"
import {
  formatDateTime,
  formatKes,
  formatUsdc,
  getStatusMeta,
  maskMpesaNumber,
  shorten,
  type WithdrawalRecord,
} from "./utils"

export function HistoryRow({
  withdrawal,
  shouldReduceMotion,
  onSelect,
}: {
  withdrawal: WithdrawalRecord
  shouldReduceMotion: boolean | null
  onSelect: (withdrawal: WithdrawalRecord) => void
}) {
  const meta = getStatusMeta(withdrawal.status)

  return (
    <motion.button
      type="button"
      variants={{
        hidden: shouldReduceMotion
          ? {}
          : { opacity: 0, y: 12, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 28,
            mass: 0.6,
          },
        },
      }}
      onClick={() => onSelect(withdrawal)}
      className="group relative w-full overflow-hidden rounded-xl border border-border/50 bg-muted/25 p-4 text-left transition-colors hover:bg-muted/40"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-linear-to-l",
          meta.gradient
        )}
        style={{
          backgroundPosition: "right",
          backgroundRepeat: "no-repeat",
          backgroundSize: "32% 100%",
        }}
      />

      <div className="relative grid gap-4 md:grid-cols-12 md:items-center">
        <div className="md:col-span-3">
          <div className="flex items-start justify-between gap-3 md:block">
            <div>
              <p className="font-semibold">
                {formatUsdc(withdrawal.amount_usdc)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatKes(withdrawal.amount_kes)}
              </p>
            </div>
            <div className="md:hidden">
              <StatusBadge status={withdrawal.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:col-span-2">
          <Phone className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium">
            {maskMpesaNumber(withdrawal.mpesa_number)}
          </span>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm font-medium md:hidden">Requested</p>
          <p className="text-sm text-muted-foreground md:text-foreground">
            {formatDateTime(withdrawal.created_at)}
          </p>
        </div>

        <div className="min-w-0 md:col-span-2">
          <p className="text-sm font-medium md:hidden">Reference</p>
          <p className="truncate font-mono text-sm text-muted-foreground md:text-foreground">
            {shorten(withdrawal.offramp_reference)}
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm font-medium md:hidden">Completed</p>
          <p className="text-sm text-muted-foreground md:text-foreground">
            {formatDateTime(withdrawal.completed_at)}
          </p>
        </div>

        <div className="hidden justify-end md:col-span-1 md:flex">
          <StatusBadge status={withdrawal.status} />
        </div>
      </div>
    </motion.button>
  )
}
