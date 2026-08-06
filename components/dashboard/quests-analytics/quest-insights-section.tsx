"use client"

import { useState } from "react"

import LoadingSpinner from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import { useQuestAnalytics } from "@/hooks/use-quests"
import { KpiCards } from "./kpi-cards"
import { TimeSeriesBar } from "./time-series-bar"
import { QuestSourcesList } from "./quest-sources-list"
import { QuestDropoffFunnel } from "./quest-dropoff-funnel"
import { QuestQuestionFunnel } from "./quest-question-funnel"
import { QuestAnswerBreakdown } from "./quest-answer-breakdown"
import { QuestSubmissionsTabs } from "./quest-submissions-tabs"
import { formatDuration, formatPercent } from "./analytics-format"
import type { PeriodValue } from "./period-filter"

type SubView = "answers" | "visits" | "drop_offs"

const SUB_VIEWS: { key: SubView; label: string }[] = [
  { key: "answers", label: "Answers" },
  { key: "visits", label: "Visits" },
  { key: "drop_offs", label: "Drop-offs" },
]

export function QuestInsightsSection({
  questId,
  period,
  ownerId,
}: {
  questId: string
  period: PeriodValue
  ownerId?: string | null
}) {
  const [view, setView] = useState<SubView>("answers")
  const { data, isLoading, error } = useQuestAnalytics(questId, period, ownerId)

  if (isLoading) {
    return (
      <div className="grid min-h-[240px] place-items-center">
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

  const { kpis, funnel } = data

  const mainKpis = [
    { label: "Visits", value: kpis.visits },
    { label: "Submissions", value: kpis.submissions },
    { label: "Unique respondents", value: kpis.unique_respondents },
    { label: "Visit duration", value: formatDuration(kpis.visit_duration_ms) },
  ]

  const dropoffKpis = [
    { label: "Started answering", value: funnel.started },
    { label: "Completions", value: funnel.completed },
    { label: "Completion rate", value: formatPercent(funnel.completion_rate) },
    {
      label: "Completion duration",
      value: formatDuration(funnel.completion_duration_ms),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="inline-flex gap-1 rounded-full border border-border/70 bg-muted/30 p-1">
        {SUB_VIEWS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setView(item.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              view === item.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {view === "drop_offs" ? (
        <>
          <KpiCards items={dropoffKpis} />
          <QuestDropoffFunnel funnel={funnel} />
          <QuestQuestionFunnel steps={data.question_funnel} />
        </>
      ) : (
        <KpiCards items={mainKpis} />
      )}

      {view === "answers" ? (
        <QuestAnswerBreakdown
          questions={data.question_breakdown}
          questId={questId}
          ownerId={ownerId}
        />
      ) : null}

      {view === "visits" ? (
        <div className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <TimeSeriesBar
              title="Visits over time"
              label="Visits"
              data={data.visits_series}
              color="var(--color-chart-2)"
            />
            <QuestSourcesList sources={data.sources} />
          </section>
          <TimeSeriesBar
            title="Submissions over time"
            label="Submissions"
            data={data.submissions_series}
            color="var(--color-chart-4)"
          />
        </div>
      ) : null}

      <section className="space-y-3">
        <h3 className="font-heading text-lg font-semibold">Submissions</h3>
        <QuestSubmissionsTabs
          completed={data.submissions.completed}
          partial={data.submissions.partial}
          totalQuestions={data.total_questions}
        />
      </section>
    </div>
  )
}
