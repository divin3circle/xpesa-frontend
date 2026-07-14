import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { assertCreatorOwnsLink, getCreatorIdForUser } from "@/lib/quests/server"

const createQuestSchema = z.object({
  linkId: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(240).optional(),
})

async function requireCreator() {
  const auth = await createClient()
  const { data } = await auth.auth.getUser()
  if (!data.user) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const creatorId = await getCreatorIdForUser(supabase, data.user.id)
  return { supabase, creatorId }
}

export async function GET() {
  try {
    const { supabase, creatorId } = await requireCreator()
    const { data, error } = await supabase
      .from("quests")
      .select("*, link:links(title,type), quest_questions(id), quest_attempts(id,score,status)")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ quests: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load quests" },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = createQuestSchema.parse(await request.json())
    const { supabase, creatorId } = await requireCreator()
    const link = await assertCreatorOwnsLink(supabase, creatorId, input.linkId)

    if (link.moderation_status !== "approved") {
      return NextResponse.json({ error: "Link must be approved" }, { status: 422 })
    }

    const { data, error } = await supabase
      .from("quests")
      .insert({
        creator_id: creatorId,
        link_id: input.linkId,
        title: input.title,
        description: input.description ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ quest: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create quest" },
      { status: 400 }
    )
  }
}
