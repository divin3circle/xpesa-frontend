import { useQuery } from "@tanstack/react-query"

import type { LinkPublic } from "@/app/api/public/creator/[handle]/route"
import {
  CreatorAnalytics,
  getCreatorAnalyticsMock,
} from "@/lib/mock/creator-analytics"

export function useCreatorAnalytics(
  handle: string | null | undefined,
  links: LinkPublic[]
) {
  return useQuery<CreatorAnalytics>({
    queryKey: [
      "creator-analytics",
      handle,
      links.length,
      links.reduce((sum, link) => sum + (link.view_count ?? 0), 0),
      links.reduce((sum, link) => sum + (link.payment_count ?? 0), 0),
    ],
    queryFn: () => getCreatorAnalyticsMock(handle!, links),
    enabled: !!handle && handle.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })
}
