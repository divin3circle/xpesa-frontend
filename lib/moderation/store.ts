import type { User } from "@supabase/supabase-js"

import { createAdminClient } from "@/lib/supabase/admin"
import type {
  ModerationActor,
  ModerationAnalysis,
  ModerationDecision,
} from "./types"

type SupabaseAdmin = ReturnType<typeof createAdminClient>

export async function recordModerationEvent({
  supabase,
  linkId,
  actorType,
  actorId,
  action,
  statusFrom,
  decision,
}: {
  supabase: SupabaseAdmin
  linkId: string
  actorType: ModerationActor
  actorId?: string | null
  action: string
  statusFrom?: string | null
  decision: ModerationDecision
}) {
  await supabase.from("content_moderation_events").insert({
    link_id: linkId,
    actor_type: actorType,
    actor_id: actorId ?? null,
    action,
    status_from: statusFrom ?? null,
    status_to: decision.status,
    reason: decision.reason,
    raw_result: decision.raw,
  })
}

export async function applyModerationDecision({
  supabase,
  link,
  decision,
  actor,
  action,
}: {
  supabase: SupabaseAdmin
  link: { id: string; moderation_status?: string | null }
  decision: ModerationDecision
  actor?: User | null
  action: string
}) {
  await supabase
    .from("links")
    .update({
      moderation_status: decision.status,
      moderation_reason: decision.reason,
      moderation_score: decision.score,
      moderation_checked_at: new Date().toISOString(),
      moderation_reviewed_at: actor ? new Date().toISOString() : null,
      moderation_reviewed_by: actor?.id ?? null,
      moderation_attempt_count: 1,
    })
    .eq("id", link.id)

  await recordModerationEvent({
    supabase,
    linkId: link.id,
    actorType: actor ? "admin" : "system",
    actorId: actor?.id,
    action,
    statusFrom: link.moderation_status,
    decision,
  })
}

export async function applyModerationAnalysis({
  supabase,
  link,
  analysis,
  actor,
}: {
  supabase: SupabaseAdmin
  link: { id: string; moderation_status?: string | null }
  analysis: ModerationAnalysis
  actor: User
}) {
  await supabase
    .from("links")
    .update({
      moderation_reason: analysis.reason,
      moderation_score: analysis.score,
      moderation_checked_at: new Date().toISOString(),
      moderation_attempt_count: 1,
    })
    .eq("id", link.id)

  await supabase.from("content_moderation_events").insert({
    link_id: link.id,
    actor_type: "admin",
    actor_id: actor.id,
    action: "ai_analysis",
    status_from: link.moderation_status,
    status_to: link.moderation_status,
    reason: analysis.reason,
    raw_result: analysis.raw,
  })
}
