import { NextResponse } from "next/server"

import { requireCreator } from "@/lib/teams/auth"

export type TeamMembershipSummary = {
  team_id: string
  name: string
  role: "owner" | "admin" | "member"
  can_export: boolean
  owner: { id: string; handle: string; display_name: string; avatar_url: string | null }
}

export type MyTeamsResponse = {
  owned: { id: string; name: string } | null
  memberships: TeamMembershipSummary[]
}

export async function GET() {
  try {
    const { supabase, creator } = await requireCreator()

    const { data: owned } = await supabase
      .from("teams")
      .select("id, name")
      .eq("owner_creator_id", creator.id)
      .single()

    const { data: memberRows } = await supabase
      .from("team_members")
      .select("team_id, role, can_export")
      .eq("member_creator_id", creator.id)

    const rows = memberRows ?? []
    const teamIds = rows.map((r) => String(r.team_id))

    let memberships: TeamMembershipSummary[] = []
    if (teamIds.length > 0) {
      const { data: teams } = await supabase
        .from("teams")
        .select("id, name, owner_creator_id")
        .in("id", teamIds)

      const teamById = new Map(
        (teams ?? []).map((t) => [String(t.id), t])
      )
      const ownerIds = Array.from(
        new Set((teams ?? []).map((t) => String(t.owner_creator_id)))
      )

      const { data: owners } = await supabase
        .from("creators")
        .select("id, handle, display_name, avatar_url")
        .in("id", ownerIds)
      const ownerById = new Map((owners ?? []).map((o) => [String(o.id), o]))

      memberships = rows
        .map((r) => {
          const team = teamById.get(String(r.team_id))
          if (!team) return null
          // The Teams group lists teams OTHERS own — the caller's own team is their Analytics.
          if (String(team.owner_creator_id) === creator.id) return null
          const owner = ownerById.get(String(team.owner_creator_id))
          return {
            team_id: String(team.id),
            name: String(team.name),
            role: r.role as TeamMembershipSummary["role"],
            can_export: Boolean(r.can_export),
            owner: {
              id: String(team.owner_creator_id),
              handle: String(owner?.handle ?? ""),
              display_name: String(owner?.display_name ?? "Creator"),
              avatar_url: owner?.avatar_url ?? null,
            },
          } satisfies TeamMembershipSummary
        })
        .filter((x): x is TeamMembershipSummary => x !== null)
    }

    return NextResponse.json<MyTeamsResponse>({
      owned: owned ? { id: String(owned.id), name: String(owned.name) } : null,
      memberships,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load teams" },
      { status: 400 }
    )
  }
}
