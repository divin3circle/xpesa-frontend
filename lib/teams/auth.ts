import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type CreatorContext = {
  id: string
  handle: string
  display_name: string
  email: string | null
  avatar_url: string | null
}

/**
 * Resolve the authenticated creator for a team/notification route.
 * Returns the admin Supabase client (bypasses RLS) + the caller's creator row.
 */
export async function requireCreator() {
  const auth = await createClient()
  const { data } = await auth.auth.getUser()
  if (!data.user) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const { data: creator } = await supabase
    .from("creators")
    .select("id, handle, display_name, email, avatar_url")
    .eq("id", data.user.id)
    .single()

  if (!creator) throw new Error("Creator profile not found")
  return { supabase, creator: creator as CreatorContext }
}
