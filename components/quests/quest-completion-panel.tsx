"use client"

import { Award, RotateCcw } from "lucide-react"

import { QuestNftClaimPanel } from "@/components/quests/quest-nft-claim-panel"
import { Button } from "@/components/ui/button"
import type { ScoreResult } from "@/lib/quests/types"

export function QuestCompletionPanel({
  questId,
  attemptId,
  score,
  onBack,
}: {
  questId: string
  attemptId: string
  score: ScoreResult | null
  onBack: () => void
}) {
  return (
    <section className="mx-auto max-w-2xl p-6 text-card-foreground">
      <div className="mb-6 grid place-items-center text-center">
        <div className="mb-4 grid size-16 place-items-center rounded-full bg-foreground text-background">
          <Award className="size-8" />
        </div>
        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
          Quest complete
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Congratulations</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your result has been submitted to the creator leaderboard.
        </p>
      </div>
      <div className="mb-5 rounded-2xl border bg-background p-4 text-center">
        <p className="text-sm text-muted-foreground">Final score</p>
        <p className="text-4xl font-semibold">
          {score ? `${score.score}/${score.maxScore}` : "--"}
        </p>
      </div>
      <QuestNftClaimPanel questId={questId} attemptId={attemptId} />
      <Button variant="outline" className="w-full" onClick={onBack}>
        <RotateCcw className="size-4" />
        Back to content
      </Button>
    </section>
  )
}
