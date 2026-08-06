"use client"

import { ArrowLeft, CheckCircle2, Sparkles, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SegmentedProgress } from "@/components/ui/segmented-progress"
import type { ScoreResult } from "@/lib/quests/types"

type Props = {
  score: ScoreResult | null
  submitted: boolean
  busy: boolean
  canScore: boolean
  answeredCount: number
  total: number
  onScore: () => void
  onSubmit: () => void
  onExitReview: () => void
}

export function QuestScorePanel({
  score,
  submitted,
  busy,
  canScore,
  answeredCount,
  total,
  onScore,
  onSubmit,
  onExitReview,
}: Props) {
  const totalQuestions = score?.explanations.length || total
  const correct = score?.correctCount ?? 0
  const pct = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0
  const segments = Math.min(Math.max(totalQuestions, 1), 30)

  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="rounded-3xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        {score ? (
          <div className="text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-7" />
            </div>
            <p className="font-heading text-4xl font-semibold tracking-tight">
              +{score.score} XP
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {correct} of {totalQuestions} correct
            </p>
            <SegmentedProgress
              value={pct}
              segments={segments}
              className="mt-6"
            />
          </div>
        ) : (
          <div className="grid place-items-center text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-foreground text-background">
              <Trophy className="size-7" />
            </div>
            <h2 className="font-heading text-2xl font-semibold">
              Review your answers
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You answered {answeredCount} of {total} questions.
            </p>
            {!canScore ? (
              <p className="mt-6 w-full rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                Answer every question to unlock scoring.
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {!score ? (
            <Button
              className="w-full"
              size="lg"
              onClick={onScore}
              disabled={busy || !canScore}
            >
              Get score
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              disabled={busy || submitted}
              onClick={onSubmit}
            >
              <CheckCircle2 className="size-4" />
              {submitted ? "Submitted" : "Submit result"}
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full"
            onClick={onExitReview}
            disabled={busy}
          >
            <ArrowLeft className="size-4" />
            Back to questions
          </Button>
        </div>
      </div>
    </section>
  )
}
