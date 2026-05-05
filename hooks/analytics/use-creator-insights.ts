import { useQuery } from "@tanstack/react-query"

import type {
  CreatorInsightsResponse,
  ErrorResponse,
} from "@/app/api/analytics/public/creator/[handle]/insights/route"

type InsightRange = "7d" | "30d" | "90d" | "all"

async function getCreatorInsights(
  handle: string,
  range: InsightRange
): Promise<CreatorInsightsResponse> {
  if (!handle || handle.trim().length === 0) {
    throw new Error("Creator handle is required")
  }

  const response = await fetch(
    `/api/analytics/public/creator/${encodeURIComponent(handle)}/insights?range=${range}`
  )

  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error || "Failed to fetch creator insights")
  }

  return response.json()
}

export function useCreatorInsights(
  handle: string | null | undefined,
  range: InsightRange = "30d"
) {
  return useQuery({
    queryKey: ["creator-insights", handle, range],
    queryFn: () => getCreatorInsights(handle!, range),
    enabled: !!handle && handle.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })
}
