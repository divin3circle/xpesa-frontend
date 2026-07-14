"use client"

import { Textarea } from "@/components/ui/textarea"
import type { QuestQuestion } from "@/lib/quests/types"

export function QuestAnswerInput({
  question,
  selectedAnswer,
  locked,
  onAnswer,
}: {
  question: QuestQuestion
  selectedAnswer?: string
  locked: boolean
  onAnswer: (value: string) => void
}) {
  if (question.type === "open_ended") {
    return (
      <Textarea
        value={selectedAnswer ?? ""}
        disabled={locked}
        rows={9}
        maxLength={1800}
        placeholder="Write your response here..."
        onChange={(event) => onAnswer(event.target.value)}
      />
    )
  }

  return (
    <div className="grid gap-3">
      {question.options.map((option) => (
        <button
          key={option}
          disabled={locked}
          className={`rounded-2xl border p-4 text-left text-sm transition disabled:cursor-not-allowed ${
            selectedAnswer === option
              ? "border-foreground bg-foreground text-background"
              : "bg-background hover:bg-foreground/5 disabled:hover:bg-background"
          }`}
          onClick={() => onAnswer(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
