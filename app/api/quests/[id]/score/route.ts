import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import { scoreQuestAnswers } from "@/lib/quests/server"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

const scoreSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.string().trim().min(1).max(1800),
    })
  ),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const input = scoreSchema.parse(await request.json())
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "quest_score",
      identity: `${id}:${input.attemptId}`,
      limit: 12,
      windowSeconds: 60,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const supabase = createAdminClient()
    const { data: questions } = await supabase
      .from("quest_questions")
      .select("*")
      .eq("quest_id", id)
      .order("sort_order", { ascending: true })

    if (!questions?.length) throw new Error("Quest has no questions")
    const result = scoreQuestAnswers(questions, input.answers)

    const { data: attempt, error } = await supabase
      .from("quest_attempts")
      .update({
        status: "scored",
        answers: input.answers,
        score: result.score,
        max_score: result.maxScore,
        correct_count: result.correctCount,
        score_result: result,
        scored_at: new Date().toISOString(),
      })
      .eq("id", input.attemptId)
      .eq("quest_id", id)
      .neq("status", "submitted")
      .select("id")
      .single()

    if (error) throw error
    if (!attempt) throw new Error("Attempt not found")
    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to score quest" },
      { status: 400 }
    )
  }
}
