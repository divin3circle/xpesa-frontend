"use client"

import { QuestQuestionEditor } from "@/components/quests/quest-question-editor"
import type { DraftQuestion } from "@/lib/quests/draft"

type Props = {
  questions: DraftQuestion[]
  onChange: (index: number, patch: Partial<DraftQuestion>) => void
  onRemove: (index: number) => void
}

export function QuestQuestionList({ questions, onChange, onRemove }: Props) {
  return questions.map((question, index) => (
    <QuestQuestionEditor
      key={index}
      index={index}
      question={question}
      canRemove={questions.length > 1}
      onChange={(patch) => onChange(index, patch)}
      onRemove={() => onRemove(index)}
    />
  ))
}
