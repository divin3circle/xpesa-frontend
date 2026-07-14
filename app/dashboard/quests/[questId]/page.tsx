"use client"

import { useState } from "react"
import Link from "next/link"
import { Download } from "lucide-react"
import { useParams } from "next/navigation"

import { QuestAttemptReviewSheet } from "@/components/quests/quest-attempt-review-sheet"
import { QuestReviewStats } from "@/components/quests/quest-review-stats"
import { QuestSubmissionsTable } from "@/components/quests/quest-submissions-table"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loading-spinner"
import {
  useQuestReview,
  type QuestReviewAttempt,
} from "@/hooks/use-quest-review"

export default function QuestReviewPage() {
  const params = useParams<{ questId: string }>()
  const questId = params.questId
  const { data, isLoading, error } = useQuestReview(questId)
  const [selected, setSelected] = useState<QuestReviewAttempt | null>(null)

  if (isLoading) {
    return (
      <div className="grid min-h-[300px] place-items-center">
        <LoadingSpinner />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-destructive">
        Could not load quest review.
      </div>
    )
  }

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Quest review
          </p>
          <h1 className="font-heading text-3xl font-semibold">
            {data.quest.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Review submissions, adjust open-ended answers, and export results.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/api/quests/${questId}/review/export`}>
              <Download className="size-4" /> Export CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/quests/create?questId=${questId}`}>
              Edit quest
            </Link>
          </Button>
        </div>
      </section>

      <QuestReviewStats attempts={data.attempts} />
      <QuestSubmissionsTable attempts={data.attempts} onSelect={setSelected} />
      <QuestAttemptReviewSheet
        questId={questId}
        attempt={selected}
        questions={data.questions}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </main>
  )
}
