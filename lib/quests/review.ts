import type { QuestAnswer, QuestQuestion } from "./types"

export type ReviewStatus = "approved" | "rejected"

export type AnswerReview = {
  questionId: string
  status?: ReviewStatus
  reason?: string
  reviewedAt?: string
  aiSuggestion?: {
    status: ReviewStatus
    confidence: number
    reason: string
    reviewedAt: string
  }
}

type StoredScoreResult = {
  reviews?: AnswerReview[]
}

type ReviewQuestion = QuestQuestion & { correct_answer: string }

export function reviewsByQuestion(scoreResult: unknown) {
  const reviews = ((scoreResult as StoredScoreResult | null)?.reviews ?? []) as AnswerReview[]
  return new Map(reviews.map((review) => [review.questionId, review]))
}

export function mergeQuestionReview(scoreResult: unknown, review: AnswerReview) {
  const existing = reviewsByQuestion(scoreResult)
  existing.set(review.questionId, {
    ...existing.get(review.questionId),
    ...review,
  })
  return Array.from(existing.values())
}

export function recalculateReviewedScore({
  questions,
  answers,
  reviews,
}: {
  questions: ReviewQuestion[]
  answers: QuestAnswer[]
  reviews: AnswerReview[]
}) {
  const answerMap = new Map(answers.map((item) => [item.questionId, item.answer]))
  const reviewMap = new Map(reviews.map((item) => [item.questionId, item]))
  let score = 0
  let correctCount = 0
  const maxScore = questions.reduce((sum, item) => sum + Number(item.points ?? 1), 0)

  const explanations = questions.map((question) => {
    const answer = answerMap.get(question.id)
    const review = reviewMap.get(question.id)
    const correct =
      question.type === "open_ended"
        ? Boolean(answer?.trim()) && review?.status !== "rejected"
        : answer === question.correct_answer

    if (correct) {
      correctCount += 1
      score += Number(question.points ?? 1)
    }

    return {
      questionId: question.id,
      correct,
      correctAnswer: question.type === "open_ended" ? "" : question.correct_answer,
      explanation: question.explanation,
      review,
    }
  })

  return { score, maxScore, correctCount, explanations, reviews }
}

export function answerForQuestion(answers: QuestAnswer[], questionId: string) {
  return answers.find((item) => item.questionId === questionId)?.answer ?? ""
}
