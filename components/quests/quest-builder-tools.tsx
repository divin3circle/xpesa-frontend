"use client"

import { Button } from "@/components/ui/button"

type Props = {
  generating: boolean
  onAddQuestion: () => void
  onAddOpenQuestion: () => void
  onGenerate: () => void
}

export function QuestBuilderTools({
  generating,
  onAddQuestion,
  onAddOpenQuestion,
  onGenerate,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={onAddQuestion}>
        Add multiple choice
      </Button>
      <Button type="button" variant="outline" onClick={onAddOpenQuestion}>
        Add open-ended
      </Button>
      <Button type="button" variant="outline" onClick={onGenerate} disabled={generating}>
        Generate with AI
      </Button>
    </div>
  )
}
