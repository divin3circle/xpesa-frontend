import { NextResponse } from "next/server"

import { getReviewQuestions, requireOwnedQuest } from "@/lib/quests/ownership"
import { answerForQuestion, reviewsByQuestion } from "@/lib/quests/review"
import type { QuestAnswer } from "@/lib/quests/types"

function csv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

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

    const header = ["Name", "Wallet", "Score", "Max Score", "Submitted At"]
    questions.forEach((question) => header.push(question.prompt, `${question.prompt} review`))
    const rows = (attempts ?? []).map((attempt) => {
      const participant = Array.isArray(attempt.participant)
        ? attempt.participant[0]
        : attempt.participant
      const answers = attempt.answers as QuestAnswer[]
      const reviews = reviewsByQuestion(attempt.score_result)
      const row = [
        participant?.display_name,
        participant?.wallet_address,
        attempt.score,
        attempt.max_score,
        attempt.submitted_at,
      ]
      questions.forEach((question) => {
        row.push(answerForQuestion(answers, question.id), reviews.get(question.id)?.status ?? "")
      })
      return row.map(csv).join(",")
    })

    return new NextResponse([header.map(csv).join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${quest.title}-submissions.csv"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "CSV export failed" },
      { status: 400 }
    )
  }
}
