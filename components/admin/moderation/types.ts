import type { ModerationStatus } from "@/lib/links/types"

export type AdminModerationLink = {
  id: string
  title: string
  type: string
  description: string | null
  destination_url: string | null
  price_usdc: number | null
  moderation_status: ModerationStatus
  moderation_reason: string | null
  moderation_score: number | null
  created_at: string
  creator?: {
    display_name: string | null
    handle: string | null
  } | null
}
