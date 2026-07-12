import { maxCategoryScore, type OpenAIModerationResult } from "./openai"
import type { ModerationAnalysis } from "./types"

export function analyzeModeration(input: {
  openai: OpenAIModerationResult
  localReason: string | null
}): ModerationAnalysis {
  const score = maxCategoryScore(input.openai)

  if (input.openai.flagged) {
    return {
      recommendation: "suggest_reject",
      reason: "AI recommends rejection because moderation flagged this content.",
      score,
      raw: { openai: input.openai, localReason: input.localReason },
    }
  }

  if (input.localReason) {
    return {
      recommendation: "suggest_reject",
      reason: input.localReason,
      score,
      raw: { openai: input.openai, localReason: input.localReason },
    }
  }

  if (score !== null && score >= 0.35) {
    return {
      recommendation: "suggest_reject",
      reason: "AI recommends rejection or closer review because the moderation score is elevated.",
      score,
      raw: { openai: input.openai, localReason: input.localReason },
    }
  }

  return {
    recommendation: "suggest_approve",
    reason: "AI recommends approval because the content appears to comply with policy.",
    score,
    raw: { openai: input.openai, localReason: input.localReason },
  }
}

export function failedAnalysis(error: unknown): ModerationAnalysis {
  return {
    recommendation: "suggest_reject",
    reason: error instanceof Error ? error.message : "Moderation failed",
    score: null,
    raw: { error: error instanceof Error ? error.message : String(error) },
  }
}
