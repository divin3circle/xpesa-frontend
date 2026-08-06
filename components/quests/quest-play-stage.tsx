"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { QuestAnswerInput } from "@/components/quests/quest-answer-input"
import { QuestCompletionPanel } from "@/components/quests/quest-completion-panel"
import { QuestScorePanel } from "@/components/quests/quest-score-panel"
import type { QuestQuestion, ScoreResult } from "@/lib/quests/types"

type PlayQuest = {
  id: string
  title: string
  description: string | null
  max_attempts: number
  questions: QuestQuestion[]
}

type Props = {
  quest: PlayQuest
  attemptId: string
  question: QuestQuestion
  current: number
  answeredCount: number
  selectedAnswer?: string
  score: ScoreResult | null
  submitted: boolean
  reviewing: boolean
  busy: boolean
  canScore: boolean
  onAnswer: (value: string) => void
  onPrevious: () => void
  onNext: () => void
  onReview: () => void
  onExitReview: () => void
  onScore: () => void
  onSubmit: () => void
  onBack: () => void
}

export function QuestPlayStage({
  quest,
  attemptId,
  question,
  current,
  answeredCount,
  selectedAnswer,
  score,
  submitted,
  reviewing,
  busy,
  canScore,
  onAnswer,
  onPrevious,
  onNext,
  onReview,
  onExitReview,
  onScore,
  onSubmit,
  onBack,
}: Props) {
  const total = quest.questions.length
  const isScored = Boolean(score)
  const isLast = current >= total - 1
  const percent = Math.round((current / Math.max(total - 1, 1)) * 100)

  if (submitted) {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <QuestCompletionPanel
          questId={quest.id}
          attemptId={attemptId}
          score={score}
          onBack={onBack}
        />
      </div>
    )
  }

  if (reviewing || isScored) {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <QuestScorePanel
          score={score}
          submitted={submitted}
          busy={busy}
          canScore={canScore}
          answeredCount={answeredCount}
          total={total}
          onScore={onScore}
          onSubmit={onSubmit}
          onExitReview={onExitReview}
        />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Thin progress line pinned to the top of the viewport. */}
      <div className="fixed inset-x-0 top-0 z-30 h-1 bg-muted/60">
        <div
          className="h-full bg-foreground transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="truncate pr-4 text-sm font-semibold">
          {quest.title}
        </span>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {current + 1} / {total}
        </span>
      </header>

      <div className="flex flex-1 items-center pb-16">
        <div className="mx-auto w-full max-w-3xl px-6 sm:px-10">
          <button
            type="button"
            onClick={onPrevious}
            disabled={current === 0}
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Back
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <p className="font-heading text-xl leading-snug font-medium text-foreground sm:text-2xl">
                {question.prompt}
              </p>

              <div className="mt-8">
                <QuestAnswerInput
                  question={question}
                  selectedAnswer={selectedAnswer}
                  locked={false}
                  onAnswer={onAnswer}
                  questId={quest.id}
                  attemptId={attemptId}
                />
              </div>

              <div className="mt-10 flex items-center gap-4">
                <Button
                  size="lg"
                  className="rounded-xl px-6"
                  onClick={isLast ? onReview : onNext}
                >
                  {isLast ? "Review" : "OK"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  ↵ Press Enter
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
