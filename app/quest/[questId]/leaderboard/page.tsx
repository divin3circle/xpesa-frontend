"use client"

import { useParams, useRouter } from "next/navigation"

import { QuestLeaderboardTable } from "@/components/ui/quest-leaderboard-table"
import { Button } from "@/components/ui/button"
import { useQuestLeaderboard } from "@/hooks/use-quests"
import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function QuestLeaderboardPage() {
  const params = useParams<{ questId: string }>()
  const router = useRouter()
  const { data, isLoading, error } = useQuestLeaderboard(params.questId)

  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="relative min-h-105 overflow-hidden rounded-2xl border-border/70">
          <div className="absolute inset-0">
            <Image
              src="/quest.png"
              alt={"Quest banner"}
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
                  {data?.quest.title} Leaderboard
                </h2>
                <p className="line-clamp-2 max-w-3xl text-sm text-muted-foreground">
                  {data?.quest.description ??
                    "Submitted player scores ranked by performance."}
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"></section>

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
