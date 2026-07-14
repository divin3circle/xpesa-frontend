"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { QuestQuestionTypeSelect } from "@/components/quests/quest-question-type-select"
import type { DraftQuestion } from "@/lib/quests/draft"

type Props = {
  index: number
  question: DraftQuestion
  onChange: (patch: Partial<DraftQuestion>) => void
  onRemove: () => void
  canRemove: boolean
}

export function QuestQuestionEditor({
  index,
  question,
  onChange,
  onRemove,
  canRemove,
}: Props) {
  function updateOption(optionIndex: number, value: string) {
    const options = [...question.options]
    options[optionIndex] = value
    onChange({ options })
  }
  const isOpenEnded = question.type === "open_ended"

  return (
    <section className="space-y-3 rounded-2xl border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          Question {index + 1}
        </p>
        {canRemove && (
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
      <Input
        value={question.prompt}
        onChange={(event) => onChange({ prompt: event.target.value })}
        placeholder={`Question ${index + 1}`}
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <QuestQuestionTypeSelect value={question.type} onChange={onChange} />
        <Input
          type="number"
          min={1}
          max={10}
          value={question.points}
          onChange={(event) => onChange({ points: Number(event.target.value) })}
          placeholder="Points"
        />
      </div>
      {!isOpenEnded && (
        <>
          {question.options.map((option, optionIndex) => (
            <Input
              key={optionIndex}
              value={option}
              onChange={(event) => updateOption(optionIndex, event.target.value)}
              placeholder={`Option ${optionIndex + 1}`}
            />
          ))}
          <Input
            value={question.correctAnswer}
            onChange={(event) => onChange({ correctAnswer: event.target.value })}
            placeholder="Correct answer"
          />
        </>
      )}
      <Textarea
        value={question.explanation}
        onChange={(event) => onChange({ explanation: event.target.value })}
        placeholder={
          isOpenEnded
            ? "Optional response guidance for reviewers"
            : "Feedback shown after scoring"
        }
      />
    </section>
  )
}
