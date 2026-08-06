import { NextRequest, NextResponse } from "next/server"

import { requireCreator } from "@/lib/teams/auth"
import { requireTeamRole } from "@/lib/teams/access"

export type TeamMemberRow = {
  id: string
  member_creator_id: string
  role: "owner" | "admin" | "member"
  can_export: boolean
  handle: string
  display_name: string
  avatar_url: string | null
}

export type PendingInvite = {
  id: string
  role: "admin" | "member"
  created_at: string
  handle: string
  display_name: string
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { supabase, creator } = await requireCreator()

    const myMembership = await requireTeamRole(supabase, creator.id, teamId, [
      "owner",
      "admin",
      "member",
    ])

    const { data: memberRows } = await supabase
      .from("team_members")
      .select("id, member_creator_id, role, can_export, created_at")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true })

    const rows = memberRows ?? []
    const creatorIds = rows.map((r) => String(r.member_creator_id))
    const { data: creators } = await supabase
      .from("creators")
      .select("id, handle, display_name, avatar_url")
      .in("id", creatorIds.length ? creatorIds : ["00000000-0000-0000-0000-000000000000"])
    const byId = new Map((creators ?? []).map((c) => [String(c.id), c]))

    const members: TeamMemberRow[] = rows.map((r) => {
      const c = byId.get(String(r.member_creator_id))
      return {
        id: String(r.id),
        member_creator_id: String(r.member_creator_id),
        role: r.role as TeamMemberRow["role"],
        can_export: Boolean(r.can_export),
        handle: String(c?.handle ?? ""),
        display_name: String(c?.display_name ?? "Creator"),
        avatar_url: c?.avatar_url ?? null,
      }
    })

    // Pending invitations (owner/admin see the full list).
    let invitations: PendingInvite[] = []
    if (myMembership.role === "owner" || myMembership.role === "admin") {
      const { data: inviteRows } = await supabase
        .from("team_invitations")
        .select("id, role, created_at, invitee_creator_id")
        .eq("team_id", teamId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      const inviteeIds = (inviteRows ?? []).map((i) => String(i.invitee_creator_id))
      const { data: invitees } = await supabase
        .from("creators")
        .select("id, handle, display_name")
        .in("id", inviteeIds.length ? inviteeIds : ["00000000-0000-0000-0000-000000000000"])
      const inviteeById = new Map((invitees ?? []).map((c) => [String(c.id), c]))

      invitations = (inviteRows ?? []).map((i) => {
        const c = inviteeById.get(String(i.invitee_creator_id))
        return {
          id: String(i.id),
          role: i.role as PendingInvite["role"],
          created_at: String(i.created_at),
          handle: String(c?.handle ?? ""),
          display_name: String(c?.display_name ?? "Creator"),
        }
      })
    }

    return NextResponse.json({
      members,
      invitations,
      myRole: myMembership.role,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load members" },
      { status: 400 }
    )
  }
}
