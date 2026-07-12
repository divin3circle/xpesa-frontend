import { createBrowserClient } from "@supabase/ssr"
import { envConfig } from "@/lib/env"

export function createClient() {
  return createBrowserClient(
    envConfig.SUPABASE_URL,
    envConfig.SUPABASE_PUBLISHABLE_KEY
  )
}
