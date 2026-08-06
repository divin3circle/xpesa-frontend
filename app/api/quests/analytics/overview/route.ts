import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { resolveAnalyticsOwner } from "@/lib/teams/access"
import { logTeamActivity } from "@/lib/teams/store"
import {
  afterSince,
  averageMs,
  groupByDay,
  parsePeriod,
  periodSince,
} from "@/lib/quests/analytics"

export type OverviewParticipant = {
  rank: number
  display_name: string
  wallet_address: string
  score: number
  max_score: number
  quests_completed: number
}

export type QuestPickerItem = {
  id: string
  title: string
  status: string
  submissions: number
}

export type QuestsOverviewResponse = {
  period: string
  totals: {
    visits: number
    unique_visitors: number
    submissions: number
    started: number
    completion_rate: number
    completion_duration_ms: number
    quest_count: number
    active_quests: number
  }
  visits_series: { date: string; count: number }[]
  submissions_series: { date: string; count: number }[]
  top_participants: OverviewParticipant[]
  quests: QuestPickerItem[]
}

type AttemptRow = {
  quest_id: string
  participant_id: string | null
  status: string
  score: number | null
  max_score: number | null
  started_at: string
  submitted_at: string | null
  participant:
    | { display_name: string | null; wallet_address: string | null }
    | { display_name: string | null; wallet_address: string | null }[]
    | null
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const period = parsePeriod(url.searchParams.get("period"))
    const since = periodSince(period)

    const auth = await createClient()
    const { data: userData } = await auth.auth.getUser()
    if (!userData.user) throw new Error("Not authenticated")

    const supabase = createAdminClient()
    // Own analytics by default; a team member may pass ?ownerId to view a shared owner.
    const owner = await resolveAnalyticsOwner(
      supabase,
      userData.user.id,
      url.searchParams.get("ownerId")
    )
    const creatorId = owner.ownerId

    // Record team members viewing a shared owner's analytics (activity log).
    if (!owner.isSelf && owner.teamId) {
      await logTeamActivity(supabase, {
        teamId: owner.teamId,
        actorCreatorId: userData.user.id,
        action: "viewed_analytics",
      })
    }

    const { data: quests } = await supabase
      .from("quests")
      .select("id,title,status")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })

    const questRows = quests ?? []
    const questIds = questRows.map((q) => String(q.id))

    if (questIds.length === 0) {
      return NextResponse.json<QuestsOverviewResponse>({
        period,
        totals: {
          visits: 0,
          unique_visitors: 0,
          submissions: 0,
          started: 0,
          completion_rate: 0,
          completion_duration_ms: 0,
          quest_count: 0,
          active_quests: 0,
        },
        visits_series: [],
        submissions_series: [],
        top_participants: [],
        quests: [],
      })
    }

    const [attemptsRes, visitsRes] = await Promise.all([
      supabase
        .from("quest_attempts")
        .select(
          "quest_id,participant_id,status,score,max_score,started_at,submitted_at, participant:quest_participants(display_name,wallet_address)"
        )
        .in("quest_id", questIds),
      supabase
        .from("quest_visits")
        .select("created_at,visitor_id")
        .in("quest_id", questIds),
    ])

    if (attemptsRes.error) throw attemptsRes.error

    const allAttempts = (attemptsRes.data ?? []) as AttemptRow[]
    const attempts = allAttempts.filter((a) => afterSince(a.started_at, since))
    const visits = (visitsRes.data ?? []).filter((v) =>
      afterSince(v.created_at as string, since)
    )
    // Submissions are scoped by submitted_at (not started_at) so a late submit counts.
    const submitted = allAttempts.filter(
      (a) => a.status === "submitted" && afterSince(a.submitted_at, since)
    )

    const started = attempts.length
    const completionDurationMs = averageMs(
      submitted.map((a) =>
        a.submitted_at && a.started_at
          ? new Date(a.submitted_at).getTime() - new Date(a.started_at).getTime()
          : null
      )
    )

    // Per-quest submission counts for the picker.
    const submissionsByQuest = new Map<string, number>()
    for (const a of submitted) {
      submissionsByQuest.set(
        a.quest_id,
        (submissionsByQuest.get(a.quest_id) ?? 0) + 1
      )
    }

    // Top participants across all quests: best attempt per quest per participant,
    // summed (mirrors the public creator leaderboard aggregation).
    const byParticipant = new Map<
      string,
      {
        display_name: string
        wallet_address: string
        quests: Map<string, { score: number; max_score: number }>
      }
    >()
    for (const a of submitted) {
      const p = Array.isArray(a.participant) ? a.participant[0] : a.participant
      const display_name = String(p?.display_name ?? "Player")
      const wallet_address = String(p?.wallet_address ?? "")
      const key = wallet_address || display_name
      const score = Number(a.score ?? 0)
      const max_score = Number(a.max_score ?? 0)
      let entry = byParticipant.get(key)
      if (!entry) {
        entry = { display_name, wallet_address, quests: new Map() }
        byParticipant.set(key, entry)
      }
      const prev = entry.quests.get(a.quest_id)
      if (!prev || score > prev.score) {
        entry.quests.set(a.quest_id, { score, max_score })
      }
    }

    const top_participants: OverviewParticipant[] = Array.from(
      byParticipant.values()
    )
      .map((entry) => {
        let score = 0
        let max_score = 0
        for (const best of entry.quests.values()) {
          score += best.score
          max_score += best.max_score
        }
        return {
          display_name: entry.display_name,
          wallet_address: entry.wallet_address,
          score,
          max_score,
          quests_completed: entry.quests.size,
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry, index) => ({ rank: index + 1, ...entry }))

    return NextResponse.json<QuestsOverviewResponse>({
      period,
      totals: {
        visits: visits.length,
        unique_visitors: new Set(visits.map((v) => v.visitor_id as string)).size,
        submissions: submitted.length,
        started,
        completion_rate: started ? submitted.length / started : 0,
        completion_duration_ms: completionDurationMs,
        quest_count: questRows.length,
        active_quests: questRows.filter((q) => q.status === "active").length,
      },
      visits_series: groupByDay(visits.map((v) => v.created_at as string)),
      submissions_series: groupByDay(submitted.map((a) => a.submitted_at)),
      top_participants,
      quests: questRows.map((q) => ({
        id: String(q.id),
        title: String(q.title),
        status: String(q.status),
        submissions: submissionsByQuest.get(String(q.id)) ?? 0,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load overview" },
      { status: 400 }
    )
  }
}
