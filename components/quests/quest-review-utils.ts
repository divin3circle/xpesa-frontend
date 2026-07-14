import type { QuestReviewAttempt } from "@/hooks/use-quest-review"

export function answerFor(attempt: QuestReviewAttempt, questionId: string) {
  return attempt.answers.find((item) => item.questionId === questionId)?.answer ?? ""
}

export function reviewFor(attempt: QuestReviewAttempt, questionId: string) {
  return attempt.score_result?.reviews?.find((item) => item.questionId === questionId)
}

export function shortWallet(value: string) {
  if (!value) return "No wallet"
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}
