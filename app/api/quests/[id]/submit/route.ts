import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

const submitSchema = z.object({
  attemptId: z.string().uuid(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const input = submitSchema.parse(await request.json())
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "quest_submit",
      identity: `${id}:${input.attemptId}`,
      limit: 12,
      windowSeconds: 60,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const supabase = createAdminClient()

    const { data: attempt } = await supabase
      .from("quest_attempts")
      .select("id,status,score")
      .eq("id", input.attemptId)
      .eq("quest_id", id)
      .single()

    if (!attempt) throw new Error("Attempt not found")
    if (attempt.status === "submitted") {
      return NextResponse.json({ attempt })
    }
    if (typeof attempt.score !== "number") {
      throw new Error("Get your score before submitting")
    }

    const { data, error } = await supabase
      .from("quest_attempts")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", input.attemptId)
      .eq("quest_id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ attempt: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit result" },
      { status: 400 }
    )
  }
}
