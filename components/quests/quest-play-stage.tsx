"use client"

import { Button } from "@/components/ui/button"
import { QuestAnswerInput } from "@/components/quests/quest-answer-input"
import { QuestCompletionPanel } from "@/components/quests/quest-completion-panel"
import { QuestProgressHeader } from "@/components/quests/quest-progress-header"
import { QuestQuestionStatus } from "@/components/quests/quest-question-status"
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
  completed: number
  selectedAnswer?: string
  score: ScoreResult | null
  submitted: boolean
  busy: boolean
  canScore: boolean
  onAnswer: (value: string) => void
  onPrevious: () => void
  onNext: () => void
  onScore: () => void
  onSubmit: () => void
  onBack: () => void
}

export function QuestPlayStage({
  quest,
  attemptId,
  question,
  current,
  completed,
  selectedAnswer,
  score,
  submitted,
  busy,
  canScore,
  onAnswer,
  onPrevious,
  onNext,
  onScore,
  onSubmit,
  onBack,
}: Props) {
  const isScored = Boolean(score)
  const isLast = current >= quest.questions.length - 1

  if (submitted) {
    return (
      <QuestCompletionPanel
        questId={quest.id}
        attemptId={attemptId}
        score={score}
        onBack={onBack}
      />
    )
  }

  return (
    <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xl">
      <QuestProgressHeader
        title={quest.title}
        completed={completed}
        total={quest.questions.length}
      />
      <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
        <section className="space-y-5 p-6">
          <QuestQuestionStatus
            current={current}
            total={quest.questions.length}
            locked={isScored}
          />
          <h2 className="text-2xl font-semibold text-foreground">
            {question.prompt}
          </h2>
          <QuestAnswerInput
            question={question}
            selectedAnswer={selectedAnswer}
            locked={isScored}
            onAnswer={onAnswer}
          />
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={current === 0}
            >
              Previous
            </Button>
            <Button onClick={onNext} disabled={isLast}>
              Next
            </Button>
          </div>
        </section>
        <QuestScorePanel
          score={score}
          submitted={submitted}
          busy={busy}
          canScore={canScore}
          onScore={onScore}
          onSubmit={onSubmit}
          onBack={onBack}
        />
      </div>
    </section>
  )
}
