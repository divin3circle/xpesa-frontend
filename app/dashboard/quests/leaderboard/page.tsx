"use client"

import { GlobalLeaderboardView } from "@/components/quests/global-leaderboard-view"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useUserDetails } from "@/hooks/use-user"

export default function DashboardLeaderboardPage() {
  const { data, isLoading } = useUserDetails()
  const handle = data?.creator?.handle

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return <GlobalLeaderboardView handle={handle} />
}
