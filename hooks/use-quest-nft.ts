"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type QuestNftCampaign = {
  id?: string
  quest_id: string
  enabled: boolean
  name: string
  description: string | null
  image_url: string | null
  image_r2_key: string | null
  status: string
}

export type QuestNftClaim = {
  id: string
  status: "eligible" | "minting" | "minted" | "failed"
  token_id: string | null
  token_uri: string | null
  image_uri: string | null
  mint_tx_hash: string | null
  failure_message: string | null
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || "Request failed")
  return body as T
}

export function useQuestNftCampaign(id?: string) {
  return useQuery({
    queryKey: ["quest-nft-campaign", id],
    queryFn: () =>
      jsonFetch<{ campaign: QuestNftCampaign | null }>(`/api/quests/${id}/nft-campaign`),
    enabled: Boolean(id),
  })
}

export function useSaveQuestNftCampaign(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      enabled: boolean
      name: string
      description?: string | null
      imageUrl?: string | null
      imageR2Key?: string | null
    }) =>
      jsonFetch<{ campaign: QuestNftCampaign }>(`/api/quests/${id}/nft-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quest-nft-campaign", id] }),
  })
}

export function useQuestNftClaim(questId: string, attemptId?: string | null) {
  return useQuery({
    queryKey: ["quest-nft-claim", questId, attemptId],
    queryFn: () =>
      jsonFetch<{ campaign: QuestNftCampaign | null; claim: QuestNftClaim | null }>(
        `/api/quests/${questId}/claims?attemptId=${attemptId}`
      ),
    enabled: Boolean(questId && attemptId),
  })
}

export function useClaimQuestNft(questId: string, attemptId?: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (recipientWalletAddress: string) =>
      jsonFetch<{ claim: QuestNftClaim }>(`/api/quests/${questId}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, recipientWalletAddress }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["quest-nft-claim", questId, attemptId] }),
  })
}
