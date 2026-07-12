import { createClient } from "@/lib/supabase/server"
import { envConfig } from "@/lib/env"

export function getAdminEmails() {
  return envConfig.ADMIN_EMAILS
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireModerationAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email?.toLowerCase()
  if (!user || !email || !getAdminEmails().includes(email)) {
    return { user: null, error: "Admin access required" }
  }

  return { user, error: null }
}
