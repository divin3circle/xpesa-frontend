"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useQuestsAnalyticsOverview } from "@/hooks/use-quests"
import { shortWallet } from "@/components/quests/quest-review-utils"
import { KpiCards } from "./kpi-cards"
import { TimeSeriesBar } from "./time-series-bar"
import { QuestInsightsSection } from "./quest-insights-section"
import { PeriodFilter, type PeriodValue } from "./period-filter"
import { formatDuration, formatPercent } from "./analytics-format"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

export function QuestsAnalyticsPanel({
  ownerId,
  canExport = false,
}: {
  ownerId?: string | null
  canExport?: boolean
} = {}) {
  const [period, setPeriod] = useState<PeriodValue>("all")
  const [questId, setQuestId] = useState<string | null>(null)
  const { data, isLoading, error } = useQuestsAnalyticsOverview(period, ownerId)

  const quests = data?.quests ?? []

  // Default the drill-down to the first quest once data arrives.
  useEffect(() => {
    if (!questId && quests.length > 0) setQuestId(quests[0].id)
  }, [questId, quests])

  if (isLoading) {
    return (
      <div className="grid min-h-[300px] place-items-center">
        <LoadingSpinner />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-destructive">
        Could not load quest analytics.
      </div>
    )
  }

  const { totals } = data

  if (totals.quest_count === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        <p className="font-heading text-lg font-semibold">No quests yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Create a quest from one of your content links to start collecting
          submissions, visits, and leaderboard insights.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/quests">Go to Quests</Link>
        </Button>
      </div>
    )
  }

  const overviewKpis = [
    {
      label: "Total visits",
      value: totals.visits,
      helper: `${totals.unique_visitors} unique visitors`,
    },
    {
      label: "Submissions",
      value: totals.submissions,
      helper: `${totals.started} started`,
    },
    {
      label: "Completion rate",
      value: formatPercent(totals.completion_rate),
      helper: "Submitted / started",
    },
    {
      label: "Avg. completion",
      value: formatDuration(totals.completion_duration_ms),
      helper: "Time to submit",
    },
  ]

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Quests &amp; Leaderboards
          </h2>
          <p className="text-sm text-muted-foreground">
            Across all {totals.quest_count} quests ({totals.active_quests}{" "}
            active).
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </section>

      <KpiCards items={overviewKpis} />

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <TimeSeriesBar
          title="Visits over time (all quests)"
          label="Visits"
          data={data.visits_series}
          color="var(--color-chart-2)"
        />
        <Card className={cardBase}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-heading text-lg">
              Top participants
            </CardTitle>
            {!ownerId ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/quests/leaderboard">Full leaderboard</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-1">
            {data.top_participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No submissions across your quests yet.
              </p>
            ) : (
              data.top_participants.slice(0, 5).map((p) => (
                <div
                  key={`${p.rank}-${p.wallet_address || p.display_name}`}
                  className="flex items-center justify-between rounded-xl px-2 py-2 text-sm hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-semibold text-muted-foreground">
                      {p.rank}
                    </span>
                    <div>
                      <p className="font-medium">{p.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {shortWallet(p.wallet_address)} · {p.quests_completed}{" "}
                        quests
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg border bg-background px-2 py-1 text-xs font-semibold">
                    {p.score}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold">
              Quest insights
            </h3>
            <p className="text-sm text-muted-foreground">
              Drill into a single quest&apos;s answers, visits, and drop-offs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canExport && questId ? (
              <Button asChild variant="outline" size="sm">
                <a
                  href={`/api/quests/${questId}/review/export${
                    ownerId ? `?ownerId=${ownerId}` : ""
                  }`}
                >
                  <Download className="size-4" /> Export
                </a>
              </Button>
            ) : null}
            <Select
              value={questId ?? undefined}
              onValueChange={(value) => setQuestId(value)}
            >
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select a quest" />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-2rem)]">
                {quests.map((quest) => (
                  <SelectItem key={quest.id} value={quest.id}>
                    <span className="block max-w-[70vw] truncate sm:max-w-xs">
                      {quest.title} ({quest.submissions})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {questId ? (
          <QuestInsightsSection
            questId={questId}
            period={period}
            ownerId={ownerId}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a quest to view its insights.
          </p>
        )}
      </section>
    </div>
  )
}
