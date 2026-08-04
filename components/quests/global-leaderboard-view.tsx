"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QuestLeaderboardTable } from "@/components/ui/quest-leaderboard-table"
import { useCreatorLeaderboard } from "@/hooks/use-quests"

type GlobalLeaderboardViewProps = {
  handle?: string | null
}

export function GlobalLeaderboardView({ handle }: GlobalLeaderboardViewProps) {
  const router = useRouter()
  const { data, isLoading, error } = useCreatorLeaderboard(handle)

  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="relative min-h-105 overflow-hidden rounded-2xl border-border/70">
          <div className="absolute inset-0">
            <Image
              src="/quest.png"
              alt="Leaderboard banner"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/5 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <div className="rounded-3xl border border-border/60 bg-background/45 p-4 backdrop-blur-xl sm:p-5">
              <div className="space-y-2">
                <h2 className="line-clamp-1 text-2xl font-semibold tracking-tight">
                  {data?.creator.display_name
                    ? `${data.creator.display_name}'s Global Leaderboard`
                    : "Global Leaderboard"}
                </h2>
                <p className="line-clamp-2 max-w-3xl text-sm text-muted-foreground">
                  Top players ranked by total score across all quests
                  {data ? ` (${data.quest_count} quests)` : ""}.
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="h-72 rounded-2xl border bg-muted/20" />
        ) : error ? (
          <div className="rounded-2xl border p-8 text-sm text-destructive">
            Could not load leaderboard.
          </div>
        ) : (
          <QuestLeaderboardTable
            entries={data?.leaderboard ?? []}
            title="Player"
          />
        )}
      </div>
    </main>
  )
}
