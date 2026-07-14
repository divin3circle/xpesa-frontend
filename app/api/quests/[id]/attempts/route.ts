import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertAccessTokenForQuest } from "@/lib/quests/server"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

const startAttemptSchema = z.object({
  accessToken: z.string().uuid(),
  participantId: z.string().uuid(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const input = startAttemptSchema.parse(await request.json())
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "quest_attempt",
      identity: `${id}:${input.participantId}`,
      limit: 10,
      windowSeconds: 60,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const supabase = createAdminClient()
    await assertAccessTokenForQuest(supabase, id, input.accessToken)

    const { data: quest } = await supabase
      .from("quests")
      .select("max_attempts,status")
      .eq("id", id)
      .single()

    if (!quest || quest.status !== "active") throw new Error("Quest is not active")

    const { count } = await supabase
      .from("quest_attempts")
      .select("id", { count: "exact", head: true })
      .eq("quest_id", id)
      .eq("participant_id", input.participantId)
      .eq("status", "submitted")

    if ((count ?? 0) >= Number(quest.max_attempts ?? 1)) {
      throw new Error("Attempt limit reached")
    }

    const { data, error } = await supabase
      .from("quest_attempts")
      .insert({
        quest_id: id,
        participant_id: input.participantId,
        access_token_id: input.accessToken,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ attempt: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start attempt" },
      { status: 400 }
    )
  }
}
