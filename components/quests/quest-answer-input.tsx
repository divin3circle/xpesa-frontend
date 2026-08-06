"use client"

import { useEffect, useRef } from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import type { QuestQuestion } from "@/lib/quests/types"
import { QuestFileAnswerInput } from "@/components/quests/quest-file-answer-input"

export function QuestAnswerInput({
  question,
  selectedAnswer,
  locked,
  onAnswer,
  questId,
  attemptId,
}: {
  question: QuestQuestion
  selectedAnswer?: string
  locked: boolean
  onAnswer: (value: string) => void
  questId?: string
  attemptId?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the borderless input, Typeform-style.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [selectedAnswer, question.id])

  if (question.type === "file") {
    return (
      <QuestFileAnswerInput
        questId={questId}
        attemptId={attemptId}
        selectedAnswer={selectedAnswer}
        locked={locked}
        onAnswer={onAnswer}
      />
    )
  }

  if (question.type === "open_ended") {
    return (
      <textarea
        ref={textareaRef}
        value={selectedAnswer ?? ""}
        disabled={locked}
        rows={1}
        maxLength={1800}
        autoFocus
        placeholder="Type your answer here..."
        onChange={(event) => onAnswer(event.target.value)}
        className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-2xl font-light caret-foreground outline-none placeholder:text-muted-foreground/40 focus:ring-0 sm:text-3xl"
      />
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {question.options.map((option, index) => {
        const selected = selectedAnswer === option
        const letter = String.fromCharCode(65 + index)
        return (
          <button
            key={option}
            type="button"
            disabled={locked}
            onClick={() => onAnswer(option)}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left text-base transition active:scale-[0.98] disabled:cursor-not-allowed",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:border-foreground/40 hover:bg-foreground/[0.04]"
            )}
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-md border text-xs font-semibold",
                selected
                  ? "border-background/40 bg-background/15 text-background"
                  : "border-border bg-muted/50 text-muted-foreground"
              )}
            >
              {letter}
            </span>
            <span className="min-w-0">{option}</span>
            {selected ? <Check className="size-4 shrink-0" /> : null}
          </button>
        )
      })}
    </div>
  )
}
