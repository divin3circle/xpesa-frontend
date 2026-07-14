"use client"

import { Bot, CheckCircle2, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  QuestAnswerReview,
  QuestReviewQuestion,
} from "@/hooks/use-quest-review"

export function QuestAnswerReviewCard({
  question,
  answer,
  review,
  busy,
  onApprove,
  onReject,
  onAi,
}: {
  question: QuestReviewQuestion
  answer: string
  review?: QuestAnswerReview
  busy: boolean
  onApprove: () => void
  onReject: () => void
  onAi: () => void
}) {
  const reviewable = question.type === "open_ended"
  return (
    <section className="rounded-2xl border bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-medium">{question.prompt}</p>
        {review?.status && <Badge variant="secondary">{review.status}</Badge>}
      </div>
      <p className="rounded-2xl bg-muted/40 p-3 text-sm whitespace-pre-wrap">
        {answer || "No answer"}
      </p>
      {review?.aiSuggestion && (
        <p className="mt-3 text-xs text-muted-foreground">
          AI: {review.aiSuggestion.status} (
          {Math.round(review.aiSuggestion.confidence * 100)}%) -{" "}
          {review.aiSuggestion.reason}
        </p>
      )}
      {reviewable && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={onAi}>
            <Bot className="size-4" /> AI review
          </Button>
          <Button size="sm" disabled={busy} onClick={onApprove}>
            <CheckCircle2 className="size-4" /> Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={onReject}
          >
            <XCircle className="size-4" /> Reject
          </Button>
        </div>
      )}
    </section>
  )
}
