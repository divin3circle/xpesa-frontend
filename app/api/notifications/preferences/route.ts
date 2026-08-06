import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireCreator } from "@/lib/teams/auth"
import { getNotificationPreferences } from "@/lib/notifications/preferences"

export async function GET() {
  try {
    const { supabase, creator } = await requireCreator()
    const preferences = await getNotificationPreferences(supabase, creator.id)
    return NextResponse.json({ preferences })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load preferences" },
      { status: 400 }
    )
  }
}

const putSchema = z.object({
  team_invite_in_app: z.boolean().optional(),
  team_invite_email: z.boolean().optional(),
  team_activity_in_app: z.boolean().optional(),
  team_activity_email: z.boolean().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const { supabase, creator } = await requireCreator()
    const input = putSchema.parse(await request.json())
    // Ensure a row exists, then apply the partial update.
    await getNotificationPreferences(supabase, creator.id)
    await supabase
      .from("notification_preferences")
      .update(input)
      .eq("creator_id", creator.id)
    const preferences = await getNotificationPreferences(supabase, creator.id)
    return NextResponse.json({ preferences })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save preferences" },
      { status: 400 }
    )
  }
}
