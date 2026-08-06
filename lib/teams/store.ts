import type { SupabaseClient } from "@supabase/supabase-js"

export type TeamRow = {
  id: string
  name: string
  owner_creator_id: string
}

/** Get the caller's owned team, creating it (+ the owner membership row) on first use. */
export async function ensureTeamForOwner(
  supabase: SupabaseClient,
  ownerCreatorId: string,
  ownerDisplayName: string
): Promise<TeamRow> {
  const { data: existing } = await supabase
    .from("teams")
    .select("id, name, owner_creator_id")
    .eq("owner_creator_id", ownerCreatorId)
    .single()

  if (existing) return existing as TeamRow

  const { data: created, error } = await supabase
    .from("teams")
    .insert({
      owner_creator_id: ownerCreatorId,
      name: `${ownerDisplayName}'s Team`,
    })
    .select("id, name, owner_creator_id")
    .single()

  if (error || !created) throw new Error(error?.message ?? "Could not create team")

  await supabase.from("team_members").upsert(
    {
      team_id: created.id,
      member_creator_id: ownerCreatorId,
      role: "owner",
      can_export: true,
    },
    { onConflict: "team_id,member_creator_id" }
  )

  return created as TeamRow
}

export async function logTeamActivity(
  supabase: SupabaseClient,
  input: {
    teamId: string
    actorCreatorId?: string | null
    action: string
    data?: Record<string, unknown>
  }
) {
  const { error } = await supabase.from("team_activity").insert({
    team_id: input.teamId,
    actor_creator_id: input.actorCreatorId ?? null,
    action: input.action,
    data: input.data ?? {},
  })
  if (error) console.error("logTeamActivity failed:", error.message)
}
