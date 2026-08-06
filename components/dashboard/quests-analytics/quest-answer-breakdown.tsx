"use client"

import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { QuestQuestionBreakdown } from "@/app/api/quests/[id]/analytics/route"
import { QuestFileAnswer } from "@/components/quests/quest-file-answer"

const cardBase = "rounded-2xl border border-border/70 bg-transparent shadow-none"

export function QuestAnswerBreakdown({
  questions,
  questId,
  ownerId,
}: {
  questions: QuestQuestionBreakdown[]
  questId?: string
  ownerId?: string | null
}) {
  if (!questions.length) {
    return (
      <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
        No questions to break down yet.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {questions.map((question) => (
        <Card key={question.id} className={cardBase}>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base">
              {question.prompt}
            </CardTitle>
            <CardDescription>
              {question.answers_count}{" "}
              {question.answers_count === 1 ? "answer" : "answers"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {question.type === "file" ? (
              <FileSamples
                samples={question.open_samples}
                questId={questId}
                ownerId={ownerId}
              />
            ) : question.type === "open_ended" ? (
              <OpenEndedSamples
                samples={question.open_samples}
                questId={questId}
              />
            ) : (
              <OptionBars
                options={question.options}
                total={question.answers_count}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function OptionBars({
  options,
  total,
}: {
  options: { label: string; count: number }[]
  total: number
}) {
  if (!options.length) {
    return <p className="text-sm text-muted-foreground">No answers yet.</p>
  }
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const pct = total ? Math.round((option.count / total) * 100) : 0
        return (
          <div
            key={option.label}
            className="relative overflow-hidden rounded-xl border border-border/60"
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/15"
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between px-3 py-2 text-sm">
              <span className="truncate pr-3">{option.label}</span>
              <span className="shrink-0 font-medium text-muted-foreground">
                {option.count}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FileSamples({
  samples,
  questId,
  ownerId,
}: {
  samples: string[]
  questId?: string
  ownerId?: string | null
}) {
  if (!samples.length || !questId) {
    return <p className="text-sm text-muted-foreground">No files yet.</p>
  }
  return (
    <div className="space-y-3">
      {samples.slice(0, 3).map((sample, index) => (
        <QuestFileAnswer
          key={index}
          questId={questId}
          answer={sample}
          ownerId={ownerId}
        />
      ))}
      <p className="text-xs text-muted-foreground/70">
        Showing up to 3 sample submissions.
      </p>
    </div>
  )
}

function OpenEndedSamples({
  samples,
  questId,
}: {
  samples: string[]
  questId?: string
}) {
  if (!samples.length) {
    return <p className="text-sm text-muted-foreground">No responses yet.</p>
  }
  return (
    <div className="space-y-2">
      {samples.slice(0, 3).map((sample, index) => (
        <div
          key={index}
          className="rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground"
        >
          {sample}
        </div>
      ))}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground/70">
          Showing up to 3 sample responses.
        </span>
        {questId ? (
          <Link
            href={`/dashboard/quests/${questId}`}
            className="font-medium text-primary hover:underline"
          >
            View all responses
          </Link>
        ) : null}
      </div>
    </div>
  )
}
