export const MODERATION_STATUSES = [
  "pending_review",
  "approved",
  "needs_review",
  "rejected",
  "failed",
] as const

export type ModerationStatus = (typeof MODERATION_STATUSES)[number]

export type ModerationActor = "system" | "admin" | "creator"

export type ModerationDecision = {
  status: ModerationStatus
  reason: string
  score: number | null
  raw: Record<string, unknown>
}

export type ModerationRecommendation = "suggest_approve" | "suggest_reject"

export type ModerationAnalysis = {
  recommendation: ModerationRecommendation
  reason: string
  score: number | null
  raw: Record<string, unknown>
}

export type ModeratedLink = {
  id: string
  creator_id: string
  type: string
  title: string
  description: string | null
  destination_url?: string | null
  thumbnail_url?: string | null
  moderation_status: ModerationStatus
  moderation_reason: string | null
  moderation_score: number | null
}
