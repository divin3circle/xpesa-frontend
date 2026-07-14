import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { uploadQuestBadgeObject } from "@/lib/quest-badges/storage"
import { getCreatorIdForUser } from "@/lib/quests/server"

const MAX_ART_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"])

async function assertOwnedQuest(questId: string) {
  const auth = await createClient()
  const { data } = await auth.auth.getUser()
  if (!data.user) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const creatorId = await getCreatorIdForUser(supabase, data.user.id)
  const { data: quest } = await supabase
    .from("quests")
    .select("id")
    .eq("id", questId)
    .eq("creator_id", creatorId)
    .single()

  if (!quest) throw new Error("Quest not found")
}

function extensionFor(contentType: string) {
  if (contentType === "image/jpeg") return "jpg"
  if (contentType === "image/webp") return "webp"
  if (contentType === "image/svg+xml") return "svg"
  return "png"
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await assertOwnedQuest(id)
    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) throw new Error("Artwork file is required")
    if (!ALLOWED_TYPES.has(file.type)) throw new Error("Upload PNG, JPG, WEBP, or SVG art")
    if (file.size > MAX_ART_BYTES) throw new Error("Artwork must be 5MB or less")

    const key = `quest-badges/art/${id}/${Date.now()}.${extensionFor(file.type)}`
    const uploaded = await uploadQuestBadgeObject({
      key,
      body: await file.arrayBuffer(),
      contentType: file.type,
    })

    return NextResponse.json({ imageUrl: uploaded.uri, imageR2Key: uploaded.key })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload artwork" },
      { status: 400 }
    )
  }
}
