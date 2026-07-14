import type { SupabaseClient } from "@supabase/supabase-js"

import type { QuestAnswer, QuestQuestion, ScoreResult } from "./types"
import { normalizeAddress } from "@/lib/view-access"

export async function getCreatorIdForUser(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("creators")
    .select("id")
    .eq("id", userId)
    .single()

  if (error || !data) throw new Error("Creator profile not found")
  return data.id as string
}

export async function assertCreatorOwnsLink(
  supabase: SupabaseClient,
  creatorId: string,
  linkId: string
) {
  const { data, error } = await supabase
    .from("links")
    .select("id, title, type, moderation_status")
    .eq("id", linkId)
    .eq("creator_id", creatorId)
    .single()

  if (error || !data) throw new Error("Link not found")
  return data
}

export async function assertAccessTokenForQuest(
  supabase: SupabaseClient,
  questId: string,
  accessToken: string
) {
  const { data, error } = await supabase
    .from("access_tokens")
    .select("id, link_id")
    .eq("id", accessToken)
    .single()

  if (error || !data) throw new Error("Access token not found")

  const { data: quest } = await supabase
    .from("quests")
    .select("link_id")
    .eq("id", questId)
    .single()

  if (!quest || quest.link_id !== data.link_id) {
    throw new Error("Access token does not match quest")
  }

  return data
}

export function scoreQuestAnswers(
  questions: (QuestQuestion & { correct_answer: string })[],
  answers: QuestAnswer[]
): ScoreResult {
  const byQuestion = new Map(answers.map((item) => [item.questionId, item.answer]))
  let score = 0
  let correctCount = 0
  const maxScore = questions.reduce((sum, item) => sum + Number(item.points ?? 1), 0)

  const explanations = questions.map((question) => {
    const provided = byQuestion.get(question.id)
    if (question.type === "open_ended") {
      const complete = Boolean(provided?.trim())
      if (complete) {
        correctCount += 1
        score += Number(question.points ?? 1)
      }
      return {
        questionId: question.id,
        correct: complete,
        correctAnswer: "",
        explanation: question.explanation,
      }
    }

    const correct = provided === question.correct_answer
    if (correct) {
      correctCount += 1
      score += Number(question.points ?? 1)
    }
    return {
      questionId: question.id,
      correct,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
    }
  })

  return { score, maxScore, correctCount, explanations }
}

export function normalizeWallet(address: string) {
  return normalizeAddress(address)
}
