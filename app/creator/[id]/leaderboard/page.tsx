"use client"

import { useParams } from "next/navigation"

import { GlobalLeaderboardView } from "@/components/quests/global-leaderboard-view"

export default function CreatorLeaderboardPage() {
  const params = useParams<{ id: string }>()
  return <GlobalLeaderboardView handle={params.id} />
}
