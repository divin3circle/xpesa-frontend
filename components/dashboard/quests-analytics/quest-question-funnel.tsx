"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { QuestFunnelStep } from "@/app/api/quests/[id]/analytics/route"

const cardBase = "rounded-2xl border border-border/70 bg-transparent shadow-none"

export function QuestQuestionFunnel({ steps }: { steps: QuestFunnelStep[] }) {
  if (!steps.length) {
    return (
      <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
        No questions to analyze yet.
      </div>
    )
  }

  const top = Math.max(1, ...steps.map((s) => s.reached))

  // Biggest outgoing drop = the question most people quit on.
  let quitIndex = -1
  let quitDrop = 0
  for (let i = 0; i < steps.length - 1; i++) {
    const drop = steps[i].reached - steps[i + 1].reached
    if (drop > quitDrop) {
      quitDrop = drop
      quitIndex = i
    }
  }

  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">
          Where people drop off
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, i) => {
          const width = Math.round((step.reached / top) * 100)
          const isQuit = i === quitIndex && quitDrop > 0
          const dropPct =
            i < steps.length - 1 && step.reached > 0
              ? Math.round(
                  ((step.reached - steps[i + 1].reached) / step.reached) * 100
                )
              : 0
          return (
            <div key={step.index} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 text-muted-foreground">
                    Q{step.index + 1}
                  </span>
                  <span className="truncate">{step.prompt}</span>
                  {isQuit ? (
                    <Badge variant="destructive" className="shrink-0">
                      Most quit here
                    </Badge>
                  ) : null}
                </span>
                <span className="shrink-0 font-medium">
                  {step.reached} reached
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted/60">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isQuit ? "bg-destructive" : "bg-primary"
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{step.answered} answered</span>
                {dropPct > 0 ? (
                  <span className={cn(isQuit && "text-destructive")}>
                    {dropPct}% drop to next
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
