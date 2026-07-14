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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: quest } = await supabase
    .from("quests")
    .select("id,title,description,link_id,reward_mode,max_attempts,status")
    .eq("id", id)
    .single()

  if (!quest || quest.status !== "active") {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 })
  }

  const { data: leaders } = await supabase
    .from("quest_attempts")
    .select("score,max_score,submitted_at, participant:quest_participants(display_name,wallet_address)")
    .eq("quest_id", id)
    .eq("status", "submitted")
    .order("score", { ascending: false })
    .order("submitted_at", { ascending: true })
    .limit(100)

  const leaderboard = rankRows(
    (leaders ?? []).map((row) => ({
      ...row,
      ...(Array.isArray(row.participant) ? row.participant[0] : row.participant),
    }))
  )

  return NextResponse.json({ quest, leaderboard })
}
