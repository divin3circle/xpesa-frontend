import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export type GlobalLeaderboardEntry = {
  rank: number
  display_name: string
  wallet_address: string
  score: number
  max_score: number
  submitted_at: string
  quests_completed: number
}

export type CreatorLeaderboardResponse = {
  creator: { display_name: string; handle: string }
  leaderboard: GlobalLeaderboardEntry[]
  quest_count: number
}

type BestAttempt = {
  score: number
  max_score: number
  submitted_at: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params

  if (!handle || handle.trim().length === 0) {
    return NextResponse.json({ error: "Invalid creator handle" }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: creator } = await supabase
    .from("creators")
    .select("id, display_name, handle")
    .eq("handle", handle.toLowerCase())
    .eq("is_active", true)
    .single()

  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 })
  }

  const { data: quests } = await supabase
    .from("quests")
    .select("id")
    .eq("creator_id", creator.id)
    .in("status", ["active", "ended"])

  const questIds = (quests ?? []).map((q) => String(q.id))

  if (questIds.length === 0) {
    return NextResponse.json<CreatorLeaderboardResponse>({
      creator: { display_name: creator.display_name, handle: creator.handle },
      leaderboard: [],
      quest_count: 0,
    })
  }

  const { data: attempts } = await supabase
    .from("quest_attempts")
    .select(
      "quest_id,score,max_score,submitted_at, participant:quest_participants(display_name,wallet_address)"
    )
    .in("quest_id", questIds)
    .eq("status", "submitted")

  // Group by participant, keeping only their best attempt per quest so multiple
  // allowed attempts on a single quest never inflate the cumulative total.
  const byParticipant = new Map<
    string,
    { display_name: string; wallet_address: string; quests: Map<string, BestAttempt> }
  >()

  for (const row of attempts ?? []) {
    const participant = Array.isArray(row.participant)
      ? row.participant[0]
      : row.participant
    const display_name = String(participant?.display_name ?? "Player")
    const wallet_address = String(participant?.wallet_address ?? "")
    const key = wallet_address || display_name
    const questId = String(row.quest_id ?? "")
    const score = Number(row.score ?? 0)
    const max_score = Number(row.max_score ?? 0)
    const submitted_at = String(row.submitted_at ?? "")

    let entry = byParticipant.get(key)
    if (!entry) {
      entry = { display_name, wallet_address, quests: new Map() }
      byParticipant.set(key, entry)
    }

    const prev = entry.quests.get(questId)
    const isBetter =
      !prev ||
      score > prev.score ||
      (score === prev.score &&
        submitted_at &&
        (!prev.submitted_at || submitted_at < prev.submitted_at))
    if (isBetter) {
      entry.quests.set(questId, { score, max_score, submitted_at })
    }
  }

  const leaderboard: GlobalLeaderboardEntry[] = Array.from(byParticipant.values())
    .map((entry) => {
      let score = 0
      let max_score = 0
      let submitted_at = ""
      for (const best of entry.quests.values()) {
        score += best.score
        max_score += best.max_score
        if (best.submitted_at && (!submitted_at || best.submitted_at < submitted_at)) {
          submitted_at = best.submitted_at
        }
      }
      return {
        display_name: entry.display_name,
        wallet_address: entry.wallet_address,
        score,
        max_score,
        submitted_at,
        quests_completed: entry.quests.size,
      }
    })
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : (a.submitted_at || "").localeCompare(b.submitted_at || "")
    )
    .slice(0, 100)
    .map((entry, index) => ({ rank: index + 1, ...entry }))

  return NextResponse.json<CreatorLeaderboardResponse>({
    creator: { display_name: creator.display_name, handle: creator.handle },
    leaderboard,
    quest_count: questIds.length,
  })
}
