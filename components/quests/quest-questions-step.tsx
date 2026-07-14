"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { QuestBuilderForm } from "@/components/quests/quest-builder-form"
import { Button } from "@/components/ui/button"
import type { CreatorQuestDetail } from "@/hooks/use-quests"

export function QuestQuestionsStep({
  questId,
  initial,
}: {
  questId: string
  initial: {
    quest: CreatorQuestDetail
    questions?: CreatorQuestDetail["quest_questions"]
  }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function backToSetup() {
    const params = new URLSearchParams(searchParams.toString())
    params.set("step", "setup")
    router.push(`/dashboard/quests/create?${params.toString()}`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
        <div>
          <p className="font-medium">Questions and answers</p>
          <p className="text-sm text-muted-foreground">
            Add answerable questions, then save draft or publish.
          </p>
        </div>
        <Button variant="destructive" onClick={backToSetup}>
          Back to setup
        </Button>
      </div>
      <QuestBuilderForm questId={questId} initial={initial} />
    </div>
  )
}
