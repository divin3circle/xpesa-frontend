import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getCreatorIdForUser } from "@/lib/quests/server"

/**
 * Server-only auth resolver for the creator offramp routes. The pure EIP-3009 authorization
 * helpers live in `withdrawal-authorization.ts` (kept separate so they stay unit-testable).
 */

export type AuthenticatedCreator = {
  supabase: ReturnType<typeof createAdminClient>
  creatorId: string
  walletAddress: string
}

/** Resolve the logged-in creator + wallet, or null if unauthenticated / no wallet. */
export async function getCurrentCreatorWithWallet(): Promise<AuthenticatedCreator | null> {
  const auth = await createClient()
  const { data } = await auth.auth.getUser()
  if (!data.user) return null

  const supabase = createAdminClient()
  const creatorId = await getCreatorIdForUser(supabase, data.user.id)
  if (!creatorId) return null

  const { data: creator } = await supabase
    .from("creators")
    .select("id, wallet_address")
    .eq("id", creatorId)
    .single()

  const walletAddress = creator?.wallet_address as string | undefined
  if (!walletAddress) return null

  return { supabase, creatorId, walletAddress }
}
