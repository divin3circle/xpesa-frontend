import { envConfig } from "@/lib/env"

type ModerationCategoryScores = Record<string, number>

export type OpenAIModerationResult = {
  flagged: boolean
  category_scores?: ModerationCategoryScores
  categories?: Record<string, boolean>
}

export async function moderateWithOpenAI(input: string) {
  if (!envConfig.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${envConfig.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: envConfig.OPENAI_MODERATION_MODEL,
      input,
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      typeof body?.error?.message === "string"
        ? body.error.message
        : `OpenAI moderation failed with ${response.status}`
    )
  }

  const result = Array.isArray(body.results) ? body.results[0] : null
  if (!result) throw new Error("OpenAI moderation returned no result")
  return result as OpenAIModerationResult
}

export function maxCategoryScore(result: OpenAIModerationResult) {
  const scores = Object.values(result.category_scores || {})
  return scores.length ? Math.max(...scores) : null
}
