export type CreatorQuestRow = {
  id: string
  link_id: string
  title: string
  status: "draft" | "active" | "ended"
  reward_mode: "none" | "top_1" | "top_3"
  max_attempts: number
  link?: { title: string; type: string } | null
  quest_questions?: { id: string }[]
  quest_attempts?: { id: string; score: number | null; status: string }[]
}
