"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DraftQuestion } from "@/lib/quests/draft"

export function QuestQuestionTypeSelect({
  value,
  onChange,
}: {
  value: DraftQuestion["type"]
  onChange: (patch: Partial<DraftQuestion>) => void
}) {
  return (
    <Select
      value={value}
      onValueChange={(type) => {
        const nextType = type as DraftQuestion["type"]
        onChange({
          type: nextType,
          options:
            nextType === "open_ended"
              ? []
              : nextType === "true_false"
                ? ["True", "False"]
                : ["", "", "", ""],
          correctAnswer: nextType === "open_ended" ? "__open_ended__" : "",
        })
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Question type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="multiple_choice">Multiple choice</SelectItem>
        <SelectItem value="true_false">True or false</SelectItem>
        <SelectItem value="open_ended">Open-ended</SelectItem>
      </SelectContent>
    </Select>
  )
}
