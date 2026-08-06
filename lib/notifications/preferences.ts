import type { SupabaseClient } from "@supabase/supabase-js"

export type NotificationPreferences = {
  creator_id: string
  team_invite_in_app: boolean
  team_invite_email: boolean
  team_activity_in_app: boolean
  team_activity_email: boolean
}

const DEFAULTS = {
  team_invite_in_app: true,
  team_invite_email: true,
  team_activity_in_app: true,
  team_activity_email: false,
}

/** Fetch a creator's preferences, lazily creating defaults on first access. */
export async function getNotificationPreferences(
  supabase: SupabaseClient,
  creatorId: string
): Promise<NotificationPreferences> {
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("creator_id", creatorId)
    .maybeSingle()

  if (data) return data as NotificationPreferences

  const row = { creator_id: creatorId, ...DEFAULTS }
  await supabase.from("notification_preferences").upsert(row, { onConflict: "creator_id" })
  return row
}
