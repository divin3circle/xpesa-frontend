import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireCreator } from "@/lib/teams/auth"
import { ensureTeamForOwner, logTeamActivity } from "@/lib/teams/store"
import { requireTeamRole, canUseTeams } from "@/lib/teams/access"
import { createNotification } from "@/lib/notifications/store"
import { getNotificationPreferences } from "@/lib/notifications/preferences"
import { sendTeamInviteEmail } from "@/lib/email/send-team-invite"

const inviteSchema = z.object({
  handle: z.string().trim().min(1).max(40),
  role: z.enum(["admin", "member"]).default("member"),
  teamId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { supabase, creator } = await requireCreator()
    if (!canUseTeams()) {
      return NextResponse.json({ error: "Teams not available on your plan" }, { status: 403 })
    }

    const input = inviteSchema.parse(await request.json())

    // Resolve the invitee — must be a registered, active creator.
    const { data: invitee } = await supabase
      .from("creators")
      .select("id, handle, display_name, email")
      .eq("handle", input.handle.toLowerCase())
      .eq("is_active", true)
      .single()

    if (!invitee) {
      return NextResponse.json({ error: "No creator found with that handle" }, { status: 404 })
    }
    if (invitee.id === creator.id) {
      return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 })
    }

    // Determine the target team: an explicit teamId (owner/admin) or the caller's own team.
    let teamId: string
    let teamName: string
    if (input.teamId) {
      await requireTeamRole(supabase, creator.id, input.teamId, ["owner", "admin"])
      const { data: team } = await supabase
        .from("teams")
        .select("id, name")
        .eq("id", input.teamId)
        .single()
      if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 })
      teamId = String(team.id)
      teamName = String(team.name)
    } else {
      const team = await ensureTeamForOwner(supabase, creator.id, creator.display_name)
      teamId = team.id
      teamName = team.name
    }

    // Already a member?
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("member_creator_id", invitee.id)
      .maybeSingle()
    if (existingMember) {
      return NextResponse.json({ error: "They're already a member" }, { status: 400 })
    }

    // Pending invite already exists?
    const { data: pending } = await supabase
      .from("team_invitations")
      .select("id")
      .eq("team_id", teamId)
      .eq("invitee_creator_id", invitee.id)
      .eq("status", "pending")
      .maybeSingle()
    if (pending) {
      return NextResponse.json({ error: "An invite is already pending for them" }, { status: 400 })
    }

    const { data: invitation, error } = await supabase
      .from("team_invitations")
      .insert({
        team_id: teamId,
        inviter_creator_id: creator.id,
        invitee_creator_id: invitee.id,
        role: input.role,
        token: crypto.randomUUID(),
      })
      .select("id, role, status, created_at")
      .single()
    if (error) throw error

    const prefs = await getNotificationPreferences(supabase, invitee.id)

    if (prefs.team_invite_in_app) {
      await createNotification(supabase, {
        recipientCreatorId: invitee.id,
        type: "team_invite",
        category: "invite",
        title: `${creator.display_name} invited you to ${teamName}`,
        body: "Open to accept or decline the invitation.",
        data: {
          team_id: teamId,
          team_name: teamName,
          invitation_id: invitation.id,
          inviter_handle: creator.handle,
          inviter_name: creator.display_name,
          role: input.role,
        },
      })
    }

    if (prefs.team_invite_email && invitee.email) {
      await sendTeamInviteEmail({
        to: invitee.email,
        inviterName: creator.display_name,
        teamName,
      })
    }

    await logTeamActivity(supabase, {
      teamId,
      actorCreatorId: creator.id,
      action: "invite_sent",
      data: { invitee_handle: invitee.handle, role: input.role },
    })

    return NextResponse.json({ invitation })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send invite" },
      { status: 400 }
    )
  }
}
