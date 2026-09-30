import {
  CheckCircle2,
  Clock3,
  XCircle,
  type LucideIcon,
} from "lucide-react"

export type NumericValue = number | string | null

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

export const WITHDRAWAL_SELECT =
  "id, created_at, creator_id, amount_usdc, amount_kes, mpesa_number, offramp_reference, mpesa_receipt, status, wallet_tx_hash, completed_at"

export const statusStyles: Record<
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

export function getStatusMeta(status: string) {
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

export function formatUsdc(value: NumericValue) {
  const amount = toNumber(value) ?? 0

  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDC`
}

export function formatKes(value: NumericValue) {
  const amount = toNumber(value)
  if (amount === null) return "KES pending"

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(value: string | null) {
  if (!value) return "Pending"

  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function shorten(value: string | null | undefined, start = 8, end = 6) {
  if (!value) return "Pending"
  if (value.length <= start + end) return value

  return `${value.slice(0, start)}...${value.slice(-end)}`
}

export function maskMpesaNumber(value: string) {
  if (value.length < 7) return value

  return `${value.slice(0, 4)} ${"*".repeat(Math.max(value.length - 7, 3))} ${value.slice(-3)}`
}
