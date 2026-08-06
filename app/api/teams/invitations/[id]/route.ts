import { NextRequest, NextResponse } from "next/server"

import { requireCreator } from "@/lib/teams/auth"
import { requireTeamRole } from "@/lib/teams/access"
import { logTeamActivity } from "@/lib/teams/store"

// Revoke a pending invitation (owner/admin only).
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, creator } = await requireCreator()

    const { data: invitation } = await supabase
      .from("team_invitations")
      .select("id, team_id, status")
      .eq("id", id)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }
    await requireTeamRole(supabase, creator.id, String(invitation.team_id), [
      "owner",
      "admin",
    ])

    if (invitation.status === "pending") {
      await supabase
        .from("team_invitations")
        .update({ status: "revoked" })
        .eq("id", id)
      await logTeamActivity(supabase, {
        teamId: String(invitation.team_id),
        actorCreatorId: creator.id,
        action: "invite_revoked",
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to revoke invite" },
      { status: 400 }
    )
  }
}
