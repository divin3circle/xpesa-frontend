import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

// Lightweight autosave beacon fired as a respondent progresses through a quest.
// Persists the partial answers + furthest question reached, but ONLY while the
// attempt is still "started" — so it can never clobber scored/submitted answers.
const progressSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        answer: z.string().max(4000),
      })
    )
    .max(100)
    .optional(),
  lastQuestionIndex: z.number().int().min(0).max(1000).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { id, attemptId } = await params
    const input = progressSchema.parse(await request.json())

    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "quest_progress",
      identity: `${id}:${attemptId}`,
      limit: 60,
      windowSeconds: 60,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const supabase = createAdminClient()

    const patch: Record<string, unknown> = {}
    if (input.answers) patch.answers = input.answers
    if (typeof input.lastQuestionIndex === "number") {
      patch.last_question_index = input.lastQuestionIndex
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: true })
    }

    await supabase
      .from("quest_attempts")
      .update(patch)
      .eq("id", attemptId)
      .eq("quest_id", id)
      .eq("status", "started")

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save progress" },
      { status: 400 }
    )
  }
}
