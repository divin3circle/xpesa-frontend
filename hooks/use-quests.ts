"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { LeaderboardEntry, QuestTeaser } from "@/lib/quests/types"

export type CreatorQuestDetail = {
  id: string
  link_id: string
  title: string
  description: string | null
  reward_mode: string
  status: string
  max_attempts: number
  leaderboard_visible?: boolean
  link?: {
    id: string
    type: string
    title: string
    description: string | null
    thumbnail_url: string | null
    price_usdc: number | null
    suggested_amount_usdc: number | null
    document_page_count: number | null
    document_file_size_bytes: number | null
    pack_file_count: number | null
    pack_total_size_bytes: number | null
    access_expiry_type: string | null
  } | null
  quest_questions?: {
    id?: string
    type: "multiple_choice" | "true_false" | "open_ended"
    prompt: string
    options: string[]
    correct_answer: string
    explanation: string | null
    points: number
    sort_order?: number
  }[]
}

export type QuestUpdateInput = {
  title?: string
  description?: string | null
  rewardMode?: string
  status?: string
  maxAttempts?: number
  leaderboardVisible?: boolean
  questions?: {
    type: "multiple_choice" | "true_false" | "open_ended"
    prompt: string
    options: string[]
    correctAnswer: string
    explanation: string
    points: number
  }[]
}

export type QuestDraftQuestion = NonNullable<QuestUpdateInput["questions"]>[number]

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || "Request failed")
  return body as T
}

export function useCreatorQuests() {
  return useQuery({
    queryKey: ["creator-quests"],
    queryFn: () => jsonFetch<{ quests: unknown[] }>("/api/quests"),
  })
}

export function useCreateQuest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { linkId: string; title: string; description?: string }) =>
      jsonFetch<{ quest: { id: string } }>("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["creator-quests"] }),
  })
}

export function useUpdateQuest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: QuestUpdateInput) =>
      jsonFetch(`/api/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quest-detail", id] })
      queryClient.invalidateQueries({ queryKey: ["creator-quests"] })
    },
  })
}

export function useQuestDetail(id?: string | null) {
  return useQuery({
    queryKey: ["quest-detail", id],
    queryFn: () =>
      jsonFetch<{ quest: CreatorQuestDetail; questions: CreatorQuestDetail["quest_questions"] }>(
        `/api/quests/${id}`
      ),
    enabled: Boolean(id),
  })
}

export function useGenerateQuest(id: string) {
  return useMutation({
    mutationFn: () =>
      jsonFetch<{ questions: QuestDraftQuestion[] }>(`/api/quests/${id}/generate`, {
      method: "POST",
      }),
  })
}

export function useQuestTeaser(linkId?: string) {
  return useQuery({
    queryKey: ["quest-teaser", linkId],
    queryFn: () =>
      jsonFetch<{ quest: QuestTeaser | null }>(`/api/public/quests/by-link/${linkId}`),
    enabled: Boolean(linkId),
  })
}

export function useQuestLeaderboard(id?: string) {
  return useQuery({
    queryKey: ["quest-leaderboard", id],
    queryFn: () =>
      jsonFetch<{
        quest: { id: string; title: string; description: string | null }
        leaderboard: LeaderboardEntry[]
      }>(`/api/public/quests/${id}/leaderboard`),
    enabled: Boolean(id),
  })
}
