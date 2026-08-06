import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireCreator } from "@/lib/teams/auth"

const readSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  all: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { supabase, creator } = await requireCreator()
    const input = readSchema.parse(await request.json())

    let query = supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_creator_id", creator.id)
      .is("read_at", null)

    if (!input.all) {
      if (!input.ids || input.ids.length === 0) {
        return NextResponse.json({ ok: true })
      }
      query = query.in("id", input.ids)
    }

    await query
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark read" },
      { status: 400 }
    )
  }
}
