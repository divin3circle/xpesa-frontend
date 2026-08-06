import { NextRequest, NextResponse } from "next/server"

import { requireCreator } from "@/lib/teams/auth"
import { requireTeamRole } from "@/lib/teams/access"

export type TeamActivityRow = {
  id: string
  action: string
  data: Record<string, unknown>
  created_at: string
  actor: { display_name: string; handle: string } | null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { supabase, creator } = await requireCreator()
    await requireTeamRole(supabase, creator.id, teamId, ["owner", "admin"])

    const { data: rows } = await supabase
      .from("team_activity")
      .select("id, action, data, created_at, actor_creator_id")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(50)

    const actorIds = Array.from(
      new Set((rows ?? []).map((r) => String(r.actor_creator_id)).filter(Boolean))
    )
    const { data: actors } = await supabase
      .from("creators")
      .select("id, display_name, handle")
      .in("id", actorIds.length ? actorIds : ["00000000-0000-0000-0000-000000000000"])
    const byId = new Map((actors ?? []).map((a) => [String(a.id), a]))

    const activity: TeamActivityRow[] = (rows ?? []).map((r) => {
      const actor = byId.get(String(r.actor_creator_id))
      return {
        id: String(r.id),
        action: String(r.action),
        data: (r.data ?? {}) as Record<string, unknown>,
        created_at: String(r.created_at),
        actor: actor
          ? { display_name: String(actor.display_name), handle: String(actor.handle) }
          : null,
      }
    })

    return NextResponse.json({ activity })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load activity" },
      { status: 400 }
    )
  }
}
