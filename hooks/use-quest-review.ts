"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreatorQuestDetail } from "@/hooks/use-quests"

export type QuestReviewQuestion = {
  id: string
  type: "multiple_choice" | "true_false" | "open_ended"
  prompt: string
  options: string[]
  correct_answer: string
  explanation: string | null
  points: number
  sort_order?: number
}

export type QuestAnswerReview = {
  questionId: string
  status?: "approved" | "rejected"
  reason?: string
  aiSuggestion?: {
    status: "approved" | "rejected"
    confidence: number
    reason: string
  }
}

export type QuestReviewAttempt = {
  id: string
  score: number | null
  max_score: number | null
  correct_count: number | null
  answers: { questionId: string; answer: string }[]
  score_result: { reviews?: QuestAnswerReview[] } | null
  submitted_at: string
  participant: { display_name: string; wallet_address: string } | null
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || "Request failed")
  return body as T
}

export function useQuestReview(id?: string) {
  return useQuery({
    queryKey: ["quest-review", id],
    queryFn: () =>
      jsonFetch<{
        quest: CreatorQuestDetail
        questions: QuestReviewQuestion[]
        attempts: QuestReviewAttempt[]
      }>(`/api/quests/${id}/review`),
    enabled: Boolean(id),
  })
}

export function useReviewQuestAnswer(questId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      attemptId: string
      questionId: string
      status: "approved" | "rejected"
      reason?: string
    }) =>
      jsonFetch(`/api/quests/${questId}/review/${input.attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quest-review", questId] }),
  })
}

export function useAiReviewQuestAnswer(questId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { attemptId: string; questionId: string }) =>
      jsonFetch(`/api/quests/${questId}/review/${input.attemptId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: input.questionId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quest-review", questId] }),
  })
}
