import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { r2, R2_BUCKET } from "@/lib/r2"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { resolveAnalyticsOwner } from "@/lib/teams/access"

// Returns a short-lived presigned URL for a quest answer file. Only the quest
// owner (or a team member with analytics access via ?ownerId) can view.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const key = url.searchParams.get("key")
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 })
    }
    if (!key.startsWith(`quest-answers/${id}/`)) {
      return NextResponse.json({ error: "Key mismatch" }, { status: 403 })
    }

    const auth = await createClient()
    const { data: userData } = await auth.auth.getUser()
    if (!userData.user) throw new Error("Not authenticated")

    const supabase = createAdminClient()
    const owner = await resolveAnalyticsOwner(
      supabase,
      userData.user.id,
      url.searchParams.get("ownerId")
    )

    const { data: quest } = await supabase
      .from("quests")
      .select("id, creator_id")
      .eq("id", id)
      .single()
    if (!quest || quest.creator_id !== owner.ownerId) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 })
    }

    const signedUrl = await getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
      { expiresIn: 120 }
    )

    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load file" },
      { status: 400 }
    )
  }
}
