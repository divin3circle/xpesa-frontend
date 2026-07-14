import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const attemptId = request.nextUrl.searchParams.get("attemptId")
    if (!attemptId) throw new Error("attemptId is required")

    const supabase = createAdminClient()
    const { data: attempt } = await supabase
      .from("quest_attempts")
      .select("id,status")
      .eq("id", attemptId)
      .eq("quest_id", id)
      .single()

    if (!attempt) throw new Error("Attempt not found")

    const { data: quest } = await supabase
      .from("quests")
      .select("id,title,description,max_attempts,reward_mode,ends_at,status")
      .eq("id", id)
      .single()

    const { data: questions } = await supabase
      .from("quest_questions")
      .select("id,type,prompt,options,points,sort_order")
      .eq("quest_id", id)
      .order("sort_order", { ascending: true })

    if (!quest || !questions?.length) throw new Error("Quest not ready")
    return NextResponse.json({ quest, attempt, questions })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load quest" },
      { status: 400 }
    )
  }
}
