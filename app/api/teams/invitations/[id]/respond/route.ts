import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireCreator } from "@/lib/teams/auth"
import { logTeamActivity } from "@/lib/teams/store"
import { createNotification } from "@/lib/notifications/store"

const respondSchema = z.object({
  action: z.enum(["accept", "decline"]),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, creator } = await requireCreator()
    const input = respondSchema.parse(await request.json())

    const { data: invitation } = await supabase
      .from("team_invitations")
      .select("id, team_id, role, status, invitee_creator_id, expires_at")
      .eq("id", id)
      .single()

    if (!invitation || invitation.invitee_creator_id !== creator.id) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }
    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "This invitation is no longer pending" }, { status: 400 })
    }
    if (new Date(invitation.expires_at as string).getTime() < Date.now()) {
      await supabase
        .from("team_invitations")
        .update({ status: "expired" })
        .eq("id", id)
        .eq("status", "pending")
      return NextResponse.json({ error: "This invitation has expired" }, { status: 400 })
    }

    const { data: team } = await supabase
      .from("teams")
      .select("id, name, owner_creator_id")
      .eq("id", invitation.team_id)
      .single()

    if (input.action === "accept") {
      await supabase.from("team_members").upsert(
        {
          team_id: invitation.team_id,
          member_creator_id: creator.id,
          role: invitation.role,
          can_export: false,
        },
        { onConflict: "team_id,member_creator_id" }
      )
      await supabase
        .from("team_invitations")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", id)

      if (team) {
        await createNotification(supabase, {
          recipientCreatorId: String(team.owner_creator_id),
          type: "team_invite_accepted",
          category: "normal",
          title: `${creator.display_name} joined ${team.name}`,
          body: null,
          data: { team_id: invitation.team_id, member_handle: creator.handle },
        })
        await logTeamActivity(supabase, {
          teamId: String(invitation.team_id),
          actorCreatorId: creator.id,
          action: "member_joined",
        })
      }
      return NextResponse.json({ status: "accepted", teamId: invitation.team_id })
    }

    await supabase
      .from("team_invitations")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", id)
    await logTeamActivity(supabase, {
      teamId: String(invitation.team_id),
      actorCreatorId: creator.id,
      action: "invite_declined",
    })
    return NextResponse.json({ status: "declined" })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to respond" },
      { status: 400 }
    )
  }
}
