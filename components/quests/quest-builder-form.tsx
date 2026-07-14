"use client"

import { useState } from "react"
import { toast } from "sonner"
import { QuestBuilderFooter } from "@/components/quests/quest-builder-footer"
import { QuestBuilderTools } from "@/components/quests/quest-builder-tools"
import { type CreatorQuestDetail, useGenerateQuest, useUpdateQuest } from "@/hooks/use-quests"
import { QuestQuestionList } from "@/components/quests/quest-question-list"
import {
  blankQuestion,
  blankOpenQuestion,
  type DraftQuestion,
  initialQuestions,
  prepareQuestionsForSave,
} from "@/lib/quests/draft"

export function QuestBuilderForm({
  questId,
  initial,
}: {
  questId: string
  initial?: { quest: CreatorQuestDetail; questions?: CreatorQuestDetail["quest_questions"] }
}) {
  const update = useUpdateQuest(questId)
  const generate = useGenerateQuest(questId)
  const [status, setStatus] = useState(initial?.quest.status ?? "draft")
  const [questions, setQuestions] = useState<DraftQuestion[]>(initialQuestions(initial?.questions))

  function patchQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((items) => items.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }

  async function save(nextStatus = status) {
    const prepared = prepareQuestionsForSave(nextStatus, questions)
    if (prepared.error) return toast.error(prepared.error)

    try {
      await update.mutateAsync({
        status: nextStatus,
        questions: prepared.questions,
      })
      setStatus(nextStatus)
      toast.success(nextStatus === "active" ? "Quest published" : "Quest saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save quest")
    }
  }

  async function generateDraft() {
    try {
      const result = await generate.mutateAsync()
      setQuestions(result.questions)
      toast.success("AI draft generated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI generation failed")
    }
  }

  return (
    <div className="space-y-6">
      <QuestBuilderTools
        generating={generate.isPending}
        onAddQuestion={() => setQuestions((q) => [...q, blankQuestion()])}
        onAddOpenQuestion={() => setQuestions((q) => [...q, blankOpenQuestion()])}
        onGenerate={generateDraft}
      />

      <QuestQuestionList
        questions={questions}
        onChange={patchQuestion}
        onRemove={(index) => setQuestions((items) => items.filter((_, i) => i !== index))}
      />

      <QuestBuilderFooter
        saving={update.isPending}
        disabledPublish={update.isPending || questions.length === 0}
        onSaveDraft={() => save("draft")}
        onPublish={() => save("active")}
      />
    </div>
  )
}
