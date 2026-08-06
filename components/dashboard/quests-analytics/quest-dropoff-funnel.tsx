"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuestAnalyticsResponse } from "@/app/api/quests/[id]/analytics/route"

const cardBase = "rounded-2xl border border-border/70 bg-transparent shadow-none"

export function QuestDropoffFunnel({
  funnel,
}: {
  funnel: QuestAnalyticsResponse["funnel"]
}) {
  const stages = [
    { label: "Form visitors", value: funnel.visitors },
    { label: "Started answering", value: funnel.started },
    { label: "Completed", value: funnel.completed },
  ]
  const top = Math.max(1, funnel.visitors, funnel.started, funnel.completed)

  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">Conversion funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage, index) => {
          const width = Math.round((stage.value / top) * 100)
          const prev = index > 0 ? stages[index - 1].value : null
          const drop =
            prev && prev > 0
              ? Math.round(((prev - stage.value) / prev) * 100)
              : null
          return (
            <div key={stage.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{stage.label}</span>
                <span className="font-medium">{stage.value}</span>
              </div>
              <div className="h-3 rounded-full bg-muted/60">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
              {drop !== null && drop > 0 ? (
                <p className="text-xs text-destructive">
                  {drop}% drop-off from previous step
                </p>
              ) : null}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
