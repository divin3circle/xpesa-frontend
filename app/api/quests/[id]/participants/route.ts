import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertAccessTokenForQuest, normalizeWallet } from "@/lib/quests/server"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

const participantSchema = z.object({
  accessToken: z.string().uuid(),
  displayName: z.string().trim().min(2).max(40),
  walletAddress: z.string().trim().min(8).max(80),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const input = participantSchema.parse(await request.json())
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "quest_enter",
      identity: `${id}:${input.walletAddress}`,
      limit: 20,
      windowSeconds: 60,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const supabase = createAdminClient()
    await assertAccessTokenForQuest(supabase, id, input.accessToken)

    const normalized = normalizeWallet(input.walletAddress)
    const { data: existing } = await supabase
      .from("quest_participants")
      .select("*")
      .eq("quest_id", id)
      .eq("wallet_address_normalized", normalized)
      .maybeSingle()

    if (existing) return NextResponse.json({ participant: existing })

    const { data, error } = await supabase
      .from("quest_participants")
      .insert({
        quest_id: id,
        display_name: input.displayName,
        wallet_address: input.walletAddress,
        wallet_address_normalized: normalized,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ participant: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to enter quest" },
      { status: 400 }
    )
  }
}
