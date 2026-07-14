import { NextResponse } from "next/server"

import { getReviewQuestions, requireOwnedQuest } from "@/lib/quests/ownership"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, quest } = await requireOwnedQuest(id)
    const questions = await getReviewQuestions(supabase, id)
    const { data: attempts, error } = await supabase
      .from("quest_attempts")
      .select("*, participant:quest_participants(display_name,wallet_address)")
      .eq("quest_id", id)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ quest, questions, attempts: attempts ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load reviews" },
      { status: 400 }
    )
  }
}
