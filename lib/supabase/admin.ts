import { createClient } from "@supabase/supabase-js"
import { envConfig } from "@/lib/env"

export function createAdminClient() {
  return createClient(
    envConfig.SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY
  )
}
