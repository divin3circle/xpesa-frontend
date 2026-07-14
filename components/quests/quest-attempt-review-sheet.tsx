"use client"

import { toast } from "sonner"

import { QuestAnswerReviewCard } from "@/components/quests/quest-answer-review-card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useAiReviewQuestAnswer,
  useReviewQuestAnswer,
  type QuestReviewAttempt,
  type QuestReviewQuestion,
} from "@/hooks/use-quest-review"
import { answerFor, reviewFor } from "./quest-review-utils"

export function QuestAttemptReviewSheet({
  questId,
  attempt,
  questions,
  onOpenChange,
}: {
  questId: string
  attempt: QuestReviewAttempt | null
  questions: QuestReviewQuestion[]
  onOpenChange: (open: boolean) => void
}) {
  const review = useReviewQuestAnswer(questId)
  const ai = useAiReviewQuestAnswer(questId)
  const open = Boolean(attempt)

  async function setStatus(questionId: string, status: "approved" | "rejected") {
    if (!attempt) return
    try {
      await review.mutateAsync({ attemptId: attempt.id, questionId, status })
      toast.success(status === "approved" ? "Answer approved" : "Answer rejected")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review failed")
    }
  }

  async function askAi(questionId: string) {
    if (!attempt) return
    try {
      await ai.mutateAsync({ attemptId: attempt.id, questionId })
      toast.success("AI suggestion ready")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI review failed")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{attempt?.participant?.display_name ?? "Submission"}</SheetTitle>
          <SheetDescription>
            Review open-ended answers and adjust the leaderboard score.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-6 pt-0">
          {attempt && questions.map((question) => (
            <QuestAnswerReviewCard
              key={question.id}
              question={question}
              answer={answerFor(attempt, question.id)}
              review={reviewFor(attempt, question.id)}
              busy={review.isPending || ai.isPending}
              onApprove={() => setStatus(question.id, "approved")}
              onReject={() => setStatus(question.id, "rejected")}
              onAi={() => askAi(question.id)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
