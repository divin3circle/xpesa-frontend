"use client"

import { CheckCircle2, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ScoreResult } from "@/lib/quests/types"

type Props = {
  score: ScoreResult | null
  submitted: boolean
  busy: boolean
  canScore: boolean
  onScore: () => void
  onSubmit: () => void
  onBack: () => void
}

export function QuestScorePanel({
  score,
  submitted,
  busy,
  canScore,
  onScore,
  onSubmit,
  onBack,
}: Props) {
  return (
    <aside className="space-y-4 border-t bg-foreground/5 p-6 lg:border-t-0 lg:border-l">
      <div className="rounded-2xl border bg-background p-4 shadow-sm">
        <Trophy className="mb-3 size-7 text-foreground" />
        <p className="text-sm text-muted-foreground">Score</p>
        <p className="text-3xl font-semibold text-foreground">
          {score ? `${score.score}/${score.maxScore}` : "--"}
        </p>
      </div>
      <Button
        className="w-full"
        onClick={onScore}
        disabled={busy || Boolean(score) || !canScore}
      >
        Get score
      </Button>
      {!score && !canScore && (
        <p className="text-center text-xs text-muted-foreground">
          Answer every question to unlock scoring.
        </p>
      )}
      <Button
        className="w-full"
        disabled={busy || !score || submitted}
        onClick={onSubmit}
      >
        <CheckCircle2 className="size-4" />
        {submitted ? "Submitted" : "Submit result"}
      </Button>
      {submitted && (
        <Button variant="outline" className="w-full" onClick={onBack}>
          Back to content
        </Button>
      )}
    </aside>
  )
}
