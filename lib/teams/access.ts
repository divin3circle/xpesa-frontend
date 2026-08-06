import type { SupabaseClient } from "@supabase/supabase-js"

export type TeamRole = "owner" | "admin" | "member"

export type AnalyticsOwnerContext = {
  ownerId: string
  isSelf: boolean
  role: TeamRole
  canExport: boolean
  teamId: string | null
}

/**
 * Single authorization gate for viewing a creator's analytics.
 * - No `requestedOwnerId` (or self) → the caller's own analytics (full access).
 * - Otherwise the caller must be an accepted member of the team owned by
 *   `requestedOwnerId`; returns their role + export permission, else throws.
 */
export async function resolveAnalyticsOwner(
  supabase: SupabaseClient,
  authUserId: string,
  requestedOwnerId?: string | null
): Promise<AnalyticsOwnerContext> {
  if (!requestedOwnerId || requestedOwnerId === authUserId) {
    return {
      ownerId: authUserId,
      isSelf: true,
      role: "owner",
      canExport: true,
      teamId: null,
    }
  }

  const { data: team } = await supabase
    .from("teams")
    .select("id, owner_creator_id")
    .eq("owner_creator_id", requestedOwnerId)
    .single()

  if (!team) throw new Error("Team not found")

  const { data: membership } = await supabase
    .from("team_members")
    .select("role, can_export")
    .eq("team_id", team.id)
    .eq("member_creator_id", authUserId)
    .single()

  if (!membership) throw new Error("Not authorized for this team")

  return {
    ownerId: requestedOwnerId,
    isSelf: false,
    role: membership.role as TeamRole,
    canExport: Boolean(membership.can_export),
    teamId: String(team.id),
  }
}

/** Require the caller to hold one of `roles` in the given team. Returns the membership. */
export async function requireTeamRole(
  supabase: SupabaseClient,
  authUserId: string,
  teamId: string,
  roles: TeamRole[]
) {
  const { data: membership } = await supabase
    .from("team_members")
    .select("id, role, can_export, team_id")
    .eq("team_id", teamId)
    .eq("member_creator_id", authUserId)
    .single()

  if (!membership || !roles.includes(membership.role as TeamRole)) {
    throw new Error("Insufficient team permissions")
  }
  return membership
}

/**
 * Subscription capability stub. Teams are the first surface of the future paid tier;
 * returns true for now so the feature is open, and is the single place to wire plan
 * gating later (owner's plan covers member seats).
 */
export function canUseTeams(_creator?: { plan?: string | null }): boolean {
  return true
}
