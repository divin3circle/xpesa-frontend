import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getQuestBadgeConfig } from "@/lib/quest-badges/config"
import { getQuestNftCampaign } from "@/lib/quest-badges/database"
import { getCreatorIdForUser } from "@/lib/quests/server"

const campaignSchema = z.object({
  enabled: z.boolean(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  imageR2Key: z.string().trim().max(300).nullable().optional(),
})

async function requireOwnedQuest(questId: string) {
  const auth = await createClient()
  const { data } = await auth.auth.getUser()
  if (!data.user) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const creatorId = await getCreatorIdForUser(supabase, data.user.id)
  const { data: quest, error } = await supabase
    .from("quests")
    .select("id,creator_id,title")
    .eq("id", questId)
    .eq("creator_id", creatorId)
    .single()

  if (error || !quest) throw new Error("Quest not found")
  return { supabase, quest }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase } = await requireOwnedQuest(id)
    return NextResponse.json({ campaign: await getQuestNftCampaign(supabase, id) })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load NFT reward" },
      { status: 400 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const input = campaignSchema.parse(await request.json())
    const { supabase, quest } = await requireOwnedQuest(id)
    const config = getQuestBadgeConfig()

    const row = {
      quest_id: quest.id,
      creator_id: quest.creator_id,
      enabled: input.enabled,
      name: input.name,
      description: input.description ?? null,
      image_url: input.imageUrl ?? null,
      image_r2_key: input.imageR2Key ?? null,
      contract_address: config.contractAddress || null,
      chain_id: config.chainId,
      status: input.enabled ? "ready" : "disabled",
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("quest_nft_campaigns")
      .upsert(row, { onConflict: "quest_id" })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ campaign: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save NFT reward" },
      { status: 400 }
    )
  }
}
