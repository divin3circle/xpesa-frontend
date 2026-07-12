export type LinkMode = "gate" | "document" | "pack" | "tip"

export type ModerationStatus =
  | "pending_review"
  | "approved"
  | "needs_review"
  | "rejected"
  | "failed"

export interface Link {
  id: string
  created_at: Date | string
  updated_at: Date | string | null
  creator_id: string
  is_active: boolean
  type: string
  title: string
  description: string | null
  destination_url: string | null
  thumbnail_url: string | null
  document_r2_key: string | null
  document_page_count: number | null
  document_file_size_bytes: number | null
  document_thumbnail_r2_key: string | null
  pack_thumbnail_r2_key: string | null
  pack_file_count: number | null
  pack_total_size_bytes: number | null
  price_usdc: number | null
  suggested_amount_usdc: number | null
  total_earned_usdc: number
  access_expiry_type: string | null
  access_max_views: number | null
  access_ip_binding: boolean
  access_wallet_binding: boolean
  doc_watermark_enabled: boolean
  doc_download_blocked: boolean
  thank_you_message: string | null
  view_count: number
  payment_count: number
  moderation_status: ModerationStatus
  moderation_reason: string | null
}

export interface LinkResponse {
  links: Link[]
  error: Error | string | null
}

interface BaseLinkParams {
  title: string
  description?: string
  thankYouMessage?: string
  thumbnailUrl?: string
  accessExpiryType?: string
  accessMaxViews?: number
  accessIpBinding?: boolean
  accessWalletBinding?: boolean
}

export type CreateLinkParams =
  | (BaseLinkParams & {
      type: "tip"
      priceUsdc?: number
      suggestedAmountUsdc?: number
    })
  | (BaseLinkParams & {
      type: "document"
      destinationUrl?: string
      documentR2Key: string
      documentPageCount: number | null
      documentFileSizeBytes: number
      documentThumbnailR2Key?: string
      priceUsdc?: number
      docWatermarkEnabled?: boolean
      docDownloadBlocked?: boolean
    })
  | (BaseLinkParams & {
      type: "pack"
      documentR2Key: string
      packThumbnailR2Key?: string
      packFileCount: number
      packTotalSizeBytes: number
      priceUsdc?: number
      docDownloadBlocked?: boolean
    })
  | (BaseLinkParams & {
      type: "gate"
      destinationUrl: string
      priceUsdc?: number
      suggestedAmountUsdc?: number
    })
