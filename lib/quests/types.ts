export type QuestStatus = "draft" | "active" | "ended"
export type QuestionType = "multiple_choice" | "true_false" | "open_ended"
export type AttemptStatus = "started" | "scored" | "submitted"
export type RewardMode = "none" | "top_1" | "top_3"

export type QuestQuestion = {
  id: string
  prompt: string
  type: QuestionType
  options: string[]
  explanation: string | null
  points: number
  sort_order: number
}

export type QuestSummary = {
  id: string
  link_id: string
  title: string
  description: string | null
  status: QuestStatus
  reward_mode: RewardMode
  max_attempts: number
  starts_at: string | null
  ends_at: string | null
  question_count?: number
  participant_count?: number
  top_score?: number | null
  link?: { title: string; type: string } | null
}

export type LeaderboardEntry = {
  rank: number
  display_name: string
  wallet_address: string
  score: number
  max_score: number
  submitted_at: string
}

export type QuestTeaser = QuestSummary & {
  leaderboard: LeaderboardEntry[]
}

export type QuestAnswer = {
  questionId: string
  answer: string
}

export type ScoreResult = {
  score: number
  maxScore: number
  correctCount: number
  explanations: Array<{
    questionId: string
    correct: boolean
    correctAnswer: string
    explanation: string | null
  }>
}
