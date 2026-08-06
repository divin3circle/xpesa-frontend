import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { resolveAnalyticsOwner } from "@/lib/teams/access"
import {
  afterSince,
  averageMs,
  groupByDay,
  parsePeriod,
  periodSince,
} from "@/lib/quests/analytics"

export type QuestAnalyticsSubmission = {
  id: string
  display_name: string
  wallet_address: string
  score: number
  max_score: number
  submitted_at: string | null
  started_at: string
  status: "started" | "scored" | "submitted"
  last_question_index?: number
  // Populated for partial (in-progress) rows so a creator can see what they wrote.
  answers?: { prompt: string; answer: string }[]
}

export type QuestFunnelStep = {
  index: number
  prompt: string
  reached: number
  answered: number
}

export type QuestAnswerOption = { label: string; count: number }

export type QuestQuestionBreakdown = {
  id: string
  prompt: string
  type: "multiple_choice" | "true_false" | "open_ended" | "file"
  answers_count: number
  options: QuestAnswerOption[]
  open_samples: string[]
}

export type QuestAnalyticsResponse = {
  quest: { id: string; title: string; status: string; link_id: string }
  period: string
  kpis: {
    visits: number
    submissions: number
    unique_respondents: number
    visit_duration_ms: number
  }
  visits_series: { date: string; count: number }[]
  submissions_series: { date: string; count: number }[]
  sources: { source: string; count: number }[]
  funnel: {
    visitors: number
    started: number
    completed: number
    completion_rate: number
    completion_duration_ms: number
    drop_off: number
    drop_off_rate: number
  }
  question_breakdown: QuestQuestionBreakdown[]
  total_questions: number
  question_funnel: QuestFunnelStep[]
  submissions: {
    completed: QuestAnalyticsSubmission[]
    partial: QuestAnalyticsSubmission[]
  }
}

type AttemptRow = {
  id: string
  participant_id: string | null
  status: string
  score: number | null
  max_score: number | null
  answers: { questionId: string; answer: string }[] | null
  last_question_index: number | null
  started_at: string
  submitted_at: string | null
  participant:
    | { display_name: string | null; wallet_address: string | null }
    | { display_name: string | null; wallet_address: string | null }[]
    | null
}

function participantOf(row: AttemptRow) {
  const p = Array.isArray(row.participant) ? row.participant[0] : row.participant
  return {
    display_name: String(p?.display_name ?? "Player"),
    wallet_address: String(p?.wallet_address ?? ""),
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: quest } = await supabase
      .from("quests")
      .select("id,title,status,link_id,creator_id")
      .eq("id", id)
      .single()

    if (!quest || quest.creator_id !== owner.ownerId) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 })
    }

    const [attemptsRes, questionsRes, visitsRes] = await Promise.all([
      supabase
        .from("quest_attempts")
        .select(
          "id,participant_id,status,score,max_score,answers,last_question_index,started_at,submitted_at, participant:quest_participants(display_name,wallet_address)"
        )
        .eq("quest_id", id),
      supabase
        .from("quest_questions")
        .select("id,prompt,type,options,sort_order")
        .eq("quest_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("quest_visits")
        .select("created_at,visitor_id,source,duration_ms")
        .eq("quest_id", id),
    ])

    if (attemptsRes.error) throw attemptsRes.error
    if (questionsRes.error) throw questionsRes.error

    const allAttempts = (attemptsRes.data ?? []) as AttemptRow[]
    const questions = questionsRes.data ?? []
    // Visits are optional — tolerate a missing table so analytics still render.
    const allVisits = visitsRes.data ?? []

    // Period-scope each dataset by its relevant timestamp.
    const attempts = allAttempts.filter((a) => afterSince(a.started_at, since))
    const visits = allVisits.filter((v) => afterSince(v.created_at as string, since))
    // Submissions are scoped by submitted_at (not started_at) so a late submit counts.
    const submitted = allAttempts.filter(
      (a) => a.status === "submitted" && afterSince(a.submitted_at, since)
    )
    const partial = attempts.filter(
      (a) => a.status === "started" || a.status === "scored"
    )

    // KPIs
    const uniqueRespondents = new Set(
      attempts.map((a) => a.participant_id).filter(Boolean)
    ).size
    const visitDurationMs = averageMs(
      visits.map((v) => v.duration_ms as number | null)
    )

    // Funnel
    const visitors = new Set(visits.map((v) => v.visitor_id as string)).size
    const started = attempts.length
    const completed = submitted.length
    const completionRate = started ? completed / started : 0
    const completionDurationMs = averageMs(
      submitted.map((a) =>
        a.submitted_at && a.started_at
          ? new Date(a.submitted_at).getTime() - new Date(a.started_at).getTime()
          : null
      )
    )
    const dropOff = Math.max(0, visitors - started)
    const dropOffRate = visitors ? dropOff / visitors : 0

    // Sources
    const sourceCounts = new Map<string, number>()
    for (const v of visits) {
      const key = String(v.source ?? "direct")
      sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1)
    }
    const sources = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    // Per-question answer breakdown (from attempts that actually have answers).
    const answered = attempts.filter((a) => (a.answers?.length ?? 0) > 0)
    const question_breakdown: QuestQuestionBreakdown[] = questions.map((q) => {
      const optionCounts = new Map<string, number>()
      const openSamples: string[] = []
      let answersCount = 0
      for (const attempt of answered) {
        const found = attempt.answers?.find((x) => x.questionId === q.id)
        const value = found?.answer?.trim()
        if (!value) continue
        answersCount += 1
        if (q.type === "open_ended" || q.type === "file") {
          if (openSamples.length < 3) openSamples.push(value)
        } else {
          optionCounts.set(value, (optionCounts.get(value) ?? 0) + 1)
        }
      }
      return {
        id: String(q.id),
        prompt: String(q.prompt),
        type: q.type as QuestQuestionBreakdown["type"],
        answers_count: answersCount,
        options: Array.from(optionCounts.entries())
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count),
        open_samples: openSamples,
      }
    })

    // Per-question funnel: how far each attempt got vs. what they answered.
    const totalQuestions = questions.length
    const promptById = new Map(
      questions.map((q) => [String(q.id), String(q.prompt)])
    )
    const question_funnel = questions.map((q, index) => {
      let reached = 0
      let answeredHere = 0
      for (const a of attempts) {
        const reachedIndex =
          a.status === "submitted"
            ? totalQuestions - 1
            : a.last_question_index ?? 0
        if (reachedIndex >= index) reached += 1
        const value = a.answers?.find((x) => x.questionId === q.id)?.answer?.trim()
        if (value) answeredHere += 1
      }
      return { index, prompt: String(q.prompt), reached, answered: answeredHere }
    })

    const toSubmission = (a: AttemptRow): QuestAnalyticsSubmission => ({
      id: a.id,
      ...participantOf(a),
      score: Number(a.score ?? 0),
      max_score: Number(a.max_score ?? 0),
      submitted_at: a.submitted_at,
      started_at: a.started_at,
      status: a.status as QuestAnalyticsSubmission["status"],
    })

    const toPartialSubmission = (a: AttemptRow): QuestAnalyticsSubmission => ({
      ...toSubmission(a),
      last_question_index: a.last_question_index ?? 0,
      answers: (a.answers ?? [])
        .filter((x) => x.answer?.trim())
        .slice(0, 20)
        .map((x) => ({
          prompt: promptById.get(x.questionId) ?? "Question",
          answer: x.answer,
        })),
    })

    const response: QuestAnalyticsResponse = {
      quest: {
        id: String(quest.id),
        title: String(quest.title),
        status: String(quest.status),
        link_id: String(quest.link_id),
      },
      period,
      kpis: {
        visits: visits.length,
        submissions: completed,
        unique_respondents: uniqueRespondents,
        visit_duration_ms: visitDurationMs,
      },
      visits_series: groupByDay(visits.map((v) => v.created_at as string)),
      submissions_series: groupByDay(submitted.map((a) => a.submitted_at)),
      sources,
      funnel: {
        visitors,
        started,
        completed,
        completion_rate: completionRate,
        completion_duration_ms: completionDurationMs,
        drop_off: dropOff,
        drop_off_rate: dropOffRate,
      },
      question_breakdown,
      total_questions: totalQuestions,
      question_funnel,
      submissions: {
        completed: submitted
          .sort((a, b) => (b.submitted_at ?? "").localeCompare(a.submitted_at ?? ""))
          .slice(0, 500)
          .map(toSubmission),
        partial: partial
          .sort((a, b) => (b.started_at ?? "").localeCompare(a.started_at ?? ""))
          .slice(0, 500)
          .map(toPartialSubmission),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load analytics" },
      { status: 400 }
    )
  }
}
