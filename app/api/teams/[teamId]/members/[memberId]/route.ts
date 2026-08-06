import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireCreator } from "@/lib/teams/auth"
import { requireTeamRole } from "@/lib/teams/access"
import { logTeamActivity } from "@/lib/teams/store"
import { createNotification } from "@/lib/notifications/store"

const patchSchema = z.object({
  role: z.enum(["admin", "member"]).optional(),
  canExport: z.boolean().optional(),
})

async function loadMember(
  supabase: Awaited<ReturnType<typeof requireCreator>>["supabase"],
  teamId: string,
  memberId: string
) {
  const { data } = await supabase
    .from("team_members")
    .select("id, team_id, member_creator_id, role, can_export")
    .eq("id", memberId)
    .eq("team_id", teamId)
    .single()
  return data
}

// Change a member's role / export permission (owner/admin).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const { teamId, memberId } = await params
    const { supabase, creator } = await requireCreator()
    await requireTeamRole(supabase, creator.id, teamId, ["owner", "admin"])
    const input = patchSchema.parse(await request.json())

    const member = await loadMember(supabase, teamId, memberId)
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })
    if (member.role === "owner") {
      return NextResponse.json({ error: "The owner cannot be modified" }, { status: 400 })
    }

    const patch: Record<string, unknown> = {}
    if (input.role) patch.role = input.role
    if (typeof input.canExport === "boolean") patch.can_export = input.canExport
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
    }

    await supabase.from("team_members").update(patch).eq("id", memberId)
    await logTeamActivity(supabase, {
      teamId,
      actorCreatorId: creator.id,
      action: "member_updated",
      data: { member_creator_id: member.member_creator_id, ...patch },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update member" },
      { status: 400 }
    )
  }
}

// Remove a member (owner/admin) or leave the team (self).
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const { teamId, memberId } = await params
    const { supabase, creator } = await requireCreator()

    const member = await loadMember(supabase, teamId, memberId)
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })
    if (member.role === "owner") {
      return NextResponse.json({ error: "The owner cannot be removed" }, { status: 400 })
    }

    const isSelf = member.member_creator_id === creator.id
    if (!isSelf) {
      await requireTeamRole(supabase, creator.id, teamId, ["owner", "admin"])
    }

    await supabase.from("team_members").delete().eq("id", memberId)
    await logTeamActivity(supabase, {
      teamId,
      actorCreatorId: creator.id,
      action: isSelf ? "member_left" : "member_removed",
      data: { member_creator_id: member.member_creator_id },
    })

    if (!isSelf) {
      await createNotification(supabase, {
        recipientCreatorId: String(member.member_creator_id),
        type: "team_member_removed",
        category: "normal",
        title: "You were removed from a team",
        body: null,
        data: { team_id: teamId },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove member" },
      { status: 400 }
    )
  }
}
