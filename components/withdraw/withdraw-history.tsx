"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Hash,
  Phone,
  ReceiptText,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { TABLENAMES } from "@/lib/supabase/utilities"
import { cn } from "@/lib/utils"

type NumericValue = number | string | null

export interface WithdrawalRecord {
  id: string
  created_at: string
  creator_id: string
  amount_usdc: NumericValue
  amount_kes: NumericValue
  mpesa_number: string
  offramp_reference: string | null
  mpesa_receipt: string | null
  status: string
  wallet_tx_hash: string | null
  completed_at: string | null
}

interface WithdrawHistoryProps {
  title?: string
  description?: string
  className?: string
}

const WITHDRAWAL_SELECT =
  "id, created_at, creator_id, amount_usdc, amount_kes, mpesa_number, offramp_reference, mpesa_receipt, status, wallet_tx_hash, completed_at"

const statusStyles: Record<
  string,
  {
    badge: string
    dot: string
    gradient: string
    icon: LucideIcon
  }
> = {
  completed: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    dot: "bg-emerald-500",
    gradient: "from-emerald-500/10 to-transparent",
    icon: CheckCircle2,
  },
  pending: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    dot: "bg-amber-500",
    gradient: "from-amber-500/10 to-transparent",
    icon: Clock3,
  },
  processing: {
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-500",
    dot: "bg-blue-500",
    gradient: "from-blue-500/10 to-transparent",
    icon: Clock3,
  },
  failed: {
    badge: "border-red-500/30 bg-red-500/10 text-red-500",
    dot: "bg-red-500",
    gradient: "from-red-500/10 to-transparent",
    icon: XCircle,
  },
  cancelled: {
    badge: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
    dot: "bg-muted-foreground",
    gradient: "from-muted/40 to-transparent",
    icon: XCircle,
  },
}

function getStatusMeta(status: string) {
  return (
    statusStyles[status.toLowerCase()] ?? {
      badge: "border-border bg-muted/40 text-muted-foreground",
      dot: "bg-muted-foreground",
      gradient: "from-muted/40 to-transparent",
      icon: Clock3,
    }
  )
}

function toNumber(value: NumericValue) {
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatUsdc(value: NumericValue) {
  const amount = toNumber(value) ?? 0

  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDC`
}

function formatKes(value: NumericValue) {
  const amount = toNumber(value)
  if (amount === null) return "KES pending"

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateTime(value: string | null) {
  if (!value) return "Pending"

  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function shorten(value: string | null | undefined, start = 8, end = 6) {
  if (!value) return "Pending"
  if (value.length <= start + end) return value

  return `${value.slice(0, start)}...${value.slice(-end)}`
}

function maskMpesaNumber(value: string) {
  if (value.length < 7) return value

  return `${value.slice(0, 4)} ${"*".repeat(Math.max(value.length - 7, 3))} ${value.slice(-3)}`
}

function StatusBadge({ status }: { status: string }) {
  const meta = getStatusMeta(status)
  const Icon = meta.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium capitalize",
        meta.badge
      )}
    >
      <Icon className="size-3.5" />
      {status}
    </span>
  )
}

function DetailItem({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/25 p-3">
      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium break-all">{value}</p>
    </div>
  )
}

function WithdrawHistorySkeleton() {
  return (
    <div className="mt-8 space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-24 animate-pulse rounded-xl border border-border/40 bg-muted/30"
        />
      ))}
    </div>
  )
}

function useRecentWithdrawals(limit = 8) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadWithdrawals() {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (!isMounted) return

      if (userError) {
        setWithdrawals([])
        setError(userError.message)
        setIsLoading(false)
        return
      }

      if (!user) {
        setWithdrawals([])
        setIsLoading(false)
        return
      }

      const { data, error: withdrawalsError } = await supabase
        .from(TABLENAMES.WITHDRAWALS)
        .select(WITHDRAWAL_SELECT)
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (!isMounted) return

      if (withdrawalsError) {
        setWithdrawals([])
        setError(withdrawalsError.message)
      } else {
        setWithdrawals((data ?? []) as WithdrawalRecord[])
      }

      setIsLoading(false)
    }

    void loadWithdrawals()

    return () => {
      isMounted = false
    }
  }, [limit])

  return { withdrawals, isLoading, error }
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
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-heading text-2xl font-semibold">{title}</h1>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{summary.completed} completed</span>
            <span className="size-1 rounded-full bg-muted-foreground/50" />
            <span>{summary.pending} pending</span>
          </div>
        </div>

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
            withdrawals.map((withdrawal) => {
              const meta = getStatusMeta(withdrawal.status)

              return (
                <motion.button
                  key={withdrawal.id}
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
                  onClick={() => setSelectedWithdrawal(withdrawal)}
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
            })
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center">
              <p className="font-medium">No withdrawals yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your recent withdrawal requests will appear here.
              </p>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {selectedWithdrawal ? (
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
                      <StatusBadge status={selectedWithdrawal.status} />
                    </div>
                    <h3 className="text-lg font-semibold">
                      {formatUsdc(selectedWithdrawal.amount_usdc)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatKes(selectedWithdrawal.amount_kes)} to{" "}
                      {maskMpesaNumber(selectedWithdrawal.mpesa_number)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedWithdrawal(null)}
                    aria-label="Close withdrawal details"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-3 overflow-y-auto p-4 md:grid-cols-2">
                  <DetailItem
                    icon={CalendarClock}
                    label="Requested"
                    value={formatDateTime(selectedWithdrawal.created_at)}
                  />
                  <DetailItem
                    icon={CheckCircle2}
                    label="Completed"
                    value={formatDateTime(selectedWithdrawal.completed_at)}
                  />
                  <DetailItem
                    icon={ReceiptText}
                    label="M-Pesa Receipt"
                    value={selectedWithdrawal.mpesa_receipt ?? "Pending"}
                  />
                  <DetailItem
                    icon={Hash}
                    label="Off-ramp Reference"
                    value={selectedWithdrawal.offramp_reference ?? "Pending"}
                  />
                  <DetailItem
                    icon={Banknote}
                    label="Creator"
                    value={shorten(selectedWithdrawal.creator_id, 10, 8)}
                  />
                  <DetailItem
                    icon={Hash}
                    label="Wallet Transaction"
                    value={shorten(selectedWithdrawal.wallet_tx_hash, 12, 10)}
                  />
                </div>

                <div className="border-t border-border/40 p-4 text-sm text-muted-foreground">
                  Withdrawal ID:{" "}
                  <span className="font-mono">
                    {shorten(selectedWithdrawal.id, 12, 8)}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  )
}
