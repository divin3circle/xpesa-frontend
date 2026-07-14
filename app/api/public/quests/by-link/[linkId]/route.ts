import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

function rankRows(rows: Record<string, unknown>[]) {
  return rows.map((row, index) => ({
    rank: index + 1,
    display_name: String(row.display_name ?? "Player"),
    wallet_address: String(row.wallet_address ?? ""),
    score: Number(row.score ?? 0),
    max_score: Number(row.max_score ?? 0),
    submitted_at: String(row.submitted_at ?? ""),
  }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params
  const supabase = createAdminClient()
  const { data: quest } = await supabase
    .from("quests")
    .select("*, quest_questions(id)")
    .eq("link_id", linkId)
    .eq("status", "active")
    .single()

  if (!quest) return NextResponse.json({ quest: null })

  const { data: leaders } = await supabase
    .from("quest_attempts")
    .select("score,max_score,submitted_at, participant:quest_participants(display_name,wallet_address)")
    .eq("quest_id", quest.id)
    .eq("status", "submitted")
    .order("score", { ascending: false })
    .order("submitted_at", { ascending: true })
    .limit(5)

  const { count: participantCount } = await supabase
    .from("quest_attempts")
    .select("participant_id", { count: "exact", head: true })
    .eq("quest_id", quest.id)
    .eq("status", "submitted")

  const leaderboard = rankRows(
    (leaders ?? []).map((row) => ({
      ...row,
      ...(Array.isArray(row.participant) ? row.participant[0] : row.participant),
    }))
  )

  return NextResponse.json({
    quest: {
      ...quest,
      question_count: quest.quest_questions?.length ?? 0,
      participant_count: participantCount ?? leaderboard.length,
      leaderboard,
    },
  })
}
