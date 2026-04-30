"use client"

import { useQuery } from "@tanstack/react-query"
import type { TokenResponse } from "@/app/api/tokens/[tokenId]/route"

async function getTokenDetails(tokenId: string): Promise<TokenResponse> {
  if (!tokenId || tokenId.trim().length === 0) {
    throw new Error("Token id is required")
  }

  const response = await fetch(`/api/tokens/${encodeURIComponent(tokenId)}`)

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.error || "Failed to fetch asset details")
  }

  return response.json()
}

export function useTokenDetails(tokenId: string | null | undefined) {
  return useQuery({
    queryKey: ["token-details", tokenId],
    queryFn: () => getTokenDetails(tokenId!),
    enabled: !!tokenId && tokenId.trim().length > 0,
    staleTime: 1000 * 60,
    retry: false,
  })
}
