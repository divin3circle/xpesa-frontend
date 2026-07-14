"use client"

import Link from "next/link"
import { Trophy, UsersRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { useQuestTeaser } from "@/hooks/use-quests"

export function QuestTeaserCard({ linkId }: { linkId: string }) {
  const { data, isLoading } = useQuestTeaser(linkId)
  const quest = data?.quest
  const leader = quest?.leaderboard[0]

  if (isLoading) return <div className="h-32 rounded-2xl border bg-muted/30" />
  if (!quest) return null

  return (
    <section className="overflow-hidden rounded-2xl border bg-background shadow-sm shadow-chart-1">
      <div className="flex flex-col gap-4 bg-emerald-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-lime-200 uppercase">
            Creator quest
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">
            {quest.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-emerald-50/75">
            Unlock the content first, then enter the leaderboard challenge.
          </p>
        </div>
        <Badge className="w-fit bg-lime-300 text-emerald-950 hover:bg-lime-300">
          {quest.reward_mode === "top_3" ? "Top 3 reward" : "Competitive"}
        </Badge>
      </div>
      <div className="grid gap-3 p-5 md:grid-cols-[1fr_280px]">
        <div className="grid gap-3 sm:grid-cols-3">
          <QuestMetric
            label="Questions"
            value={String(quest.question_count ?? 0)}
          />
          <QuestMetric label="Attempts" value={`${quest.max_attempts} max`} />
          <QuestMetric
            label="Players"
            value={String(quest.participant_count ?? 0)}
          />
        </div>
        <Link
          href={`/quest/${quest.id}/leaderboard`}
          className="block rounded-2xl bg-foreground/5 p-4 transition hover:bg-foreground/10"
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Trophy className="size-4" />
            Current leader
          </div>
          {leader ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold">{leader.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  View full leaderboard
                </p>
              </div>
              <span className="rounded-2xl border bg-background px-2 py-1 font-semibold">
                {leader.score}/{leader.max_score}
              </span>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <UsersRound className="size-4" />
              No players yet
            </p>
          )}
        </Link>
      </div>
    </section>
  )
}

function QuestMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-foreground/5 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}
