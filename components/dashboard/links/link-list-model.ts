import type { Link as LinkRecord, ModerationStatus } from "@/lib/links/types"

export type LinkType = "gate" | "document" | "pack" | "tip"

export type LinkItem = {
  id: string
  title: string
  type: LinkType
  price: string
  stats: string
  active: boolean
  moderationStatus: ModerationStatus
  moderationReason: string | null
  pageCount?: number
  fileSizeBytes?: number
  fileCount?: number
  totalSizeBytes?: number
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return null
  return `${amount.toFixed(2)} USDC`
}

export function toLinkItem(link: LinkRecord): LinkItem {
  const priceLabel =
    link.type === "tip"
      ? (formatCurrency(link.suggested_amount_usdc) ?? "Any")
      : (formatCurrency(link.price_usdc) ?? "Free")

  return {
    id: link.id,
    title: link.title,
    type: link.type as LinkType,
    price: priceLabel,
    stats: `${link.view_count} views • ${link.payment_count} payments • ${
      formatCurrency(link.total_earned_usdc) ?? "0.00 USDC"
    } earned`,
    active: link.is_active,
    moderationStatus: link.moderation_status,
    moderationReason: link.moderation_reason,
    pageCount: link.document_page_count ?? undefined,
    fileSizeBytes: link.document_file_size_bytes ?? undefined,
    fileCount: link.pack_file_count ?? undefined,
    totalSizeBytes: link.pack_total_size_bytes ?? undefined,
  }
}
