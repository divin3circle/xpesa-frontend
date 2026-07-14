import { NextResponse } from "next/server"
import { z } from "zod"

import { getReviewQuestions, requireOwnedQuest } from "@/lib/quests/ownership"
import {
  mergeQuestionReview,
  recalculateReviewedScore,
  type ReviewStatus,
} from "@/lib/quests/review"
import type { QuestAnswer } from "@/lib/quests/types"

const reviewSchema = z.object({
  questionId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().trim().max(500).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { id, attemptId } = await params
    const input = reviewSchema.parse(await request.json())
    const { supabase } = await requireOwnedQuest(id)
    const questions = await getReviewQuestions(supabase, id)
    const question = questions.find((item) => item.id === input.questionId)
    if (!question || question.type !== "open_ended") {
      throw new Error("Only open-ended answers can be manually reviewed")
    }

    const { data: attempt } = await supabase
      .from("quest_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("quest_id", id)
      .single()
    if (!attempt) throw new Error("Attempt not found")

    const reviews = mergeQuestionReview(attempt.score_result, {
      questionId: input.questionId,
      status: input.status as ReviewStatus,
      reason: input.reason,
      reviewedAt: new Date().toISOString(),
    })
    const result = recalculateReviewedScore({
      questions,
      answers: attempt.answers as QuestAnswer[],
      reviews,
    })

    const { data, error } = await supabase
      .from("quest_attempts")
      .update({
        score: result.score,
        correct_count: result.correctCount,
        max_score: result.maxScore,
        score_result: result,
      })
      .eq("id", attemptId)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ attempt: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to review answer" },
      { status: 400 }
    )
  }
}
