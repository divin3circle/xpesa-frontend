import { NextResponse } from "next/server"
import { z } from "zod"

import { envConfig } from "@/lib/env"
import { getReviewQuestions, requireOwnedQuest } from "@/lib/quests/ownership"
import { answerForQuestion, mergeQuestionReview } from "@/lib/quests/review"
import type { QuestAnswer } from "@/lib/quests/types"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

const inputSchema = z.object({ questionId: z.string().uuid() })
const aiSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1).max(500),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    if (!envConfig.OPENAI_API_KEY) throw new Error("OpenAI is not configured")
    const { id, attemptId } = await params
    const input = inputSchema.parse(await request.json())
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "quest_review_ai",
      identity: `${id}:${attemptId}`,
      limit: 10,
      windowSeconds: 300,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const { supabase, quest } = await requireOwnedQuest(id)
    const questions = await getReviewQuestions(supabase, id)
    const question = questions.find((item) => item.id === input.questionId)
    if (!question || question.type !== "open_ended") throw new Error("Question not reviewable")

    const { data: attempt } = await supabase
      .from("quest_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("quest_id", id)
      .single()
    if (!attempt) throw new Error("Attempt not found")

    const answer = answerForQuestion(attempt.answers as QuestAnswer[], input.questionId)
    const suggestion = await getAiSuggestion(quest.title, question.prompt, answer)
    const reviews = mergeQuestionReview(attempt.score_result, {
      questionId: input.questionId,
      aiSuggestion: { ...suggestion, reviewedAt: new Date().toISOString() },
    })
    const { error } = await supabase
      .from("quest_attempts")
      .update({ score_result: { ...(attempt.score_result ?? {}), reviews } })
      .eq("id", attemptId)
    if (error) throw error

    return NextResponse.json({ suggestion })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI review failed" },
      { status: 400 }
    )
  }
}

async function getAiSuggestion(quest: string, prompt: string, answer: string) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${envConfig.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: `Review this quest answer. Return JSON only with status approved/rejected, confidence 0-1, and reason.\nQuest: ${quest}\nPrompt: ${prompt}\nAnswer: ${answer}`,
      text: { format: { type: "json_object" } },
    }),
  })
  if (!response.ok) throw new Error(`OpenAI review failed with ${response.status}`)
  const payload = await response.json()
  const text = payload.output_text ?? payload.output?.[0]?.content?.[0]?.text
  return aiSchema.parse(JSON.parse(String(text)))
}
