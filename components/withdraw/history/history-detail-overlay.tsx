"use client"

import { motion } from "framer-motion"
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  Hash,
  ReceiptText,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import { DetailItem } from "./detail-item"
import { StatusBadge } from "./status-badge"
import {
  formatDateTime,
  formatKes,
  formatUsdc,
  maskMpesaNumber,
  shorten,
  type WithdrawalRecord,
} from "./utils"

export function HistoryDetailOverlay({
  withdrawal,
  shouldReduceMotion,
  onClose,
}: {
  withdrawal: WithdrawalRecord
  shouldReduceMotion: boolean | null
  onClose: () => void
}) {
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex rounded-2xl bg-background/80 p-3 backdrop-blur-sm md:p-6"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { y: 14, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { y: 14, scale: 0.98 }}
        className="flex min-h-0 w-full flex-col rounded-xl border border-border/50 bg-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/40 p-4">
          <div>
            <div className="mb-2">
              <StatusBadge status={withdrawal.status} />
            </div>
            <h3 className="text-lg font-semibold">
              {formatUsdc(withdrawal.amount_usdc)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatKes(withdrawal.amount_kes)} to{" "}
              {maskMpesaNumber(withdrawal.mpesa_number)}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Close withdrawal details"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="grid gap-3 overflow-y-auto p-4 md:grid-cols-2">
          <DetailItem
            icon={CalendarClock}
            label="Requested"
            value={formatDateTime(withdrawal.created_at)}
          />
          <DetailItem
            icon={CheckCircle2}
            label="Completed"
            value={formatDateTime(withdrawal.completed_at)}
          />
          <DetailItem
            icon={ReceiptText}
            label="M-Pesa Receipt"
            value={withdrawal.mpesa_receipt ?? "Pending"}
          />
          <DetailItem
            icon={Hash}
            label="Off-ramp Reference"
            value={withdrawal.offramp_reference ?? "Pending"}
          />
          <DetailItem
            icon={Banknote}
            label="Creator"
            value={shorten(withdrawal.creator_id, 10, 8)}
          />
          <DetailItem
            icon={Hash}
            label="Wallet Transaction"
            value={shorten(withdrawal.wallet_tx_hash, 12, 10)}
          />
        </div>

        <div className="border-t border-border/40 p-4 text-sm text-muted-foreground">
          Withdrawal ID:{" "}
          <span className="font-mono">
            {shorten(withdrawal.id, 12, 8)}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
