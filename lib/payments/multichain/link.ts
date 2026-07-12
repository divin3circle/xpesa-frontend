type SupabaseAdminClient = ReturnType<
  typeof import("@/lib/supabase/admin").createAdminClient
>

export type MultichainLink = {
  id: string
  creator_id: string
  type: string
  price_usdc: number | string | null
  suggested_amount_usdc: number | string | null
  access_expiry_type: string | null
  access_ip_binding: boolean | null
  access_max_views: number | null
  creator: { wallet_address: string | null } | { wallet_address: string | null }[]
}

export function resolveLinkAmount(link: MultichainLink) {
  const amount = Number(link.suggested_amount_usdc ?? link.price_usdc ?? 0)
  return Number.isFinite(amount) ? amount : 0
}

export function getCreatorWallet(link: MultichainLink) {
  const creator = Array.isArray(link.creator) ? link.creator[0] : link.creator
  return creator?.wallet_address ?? null
}

export async function getValidPaidLink({
  supabase,
  linkId,
  amountUsdc,
}: {
  supabase: SupabaseAdminClient
  linkId: string
  amountUsdc: number
}) {
  const { data: link, error } = await supabase
    .from("links")
    .select(
      "id, creator_id, type, price_usdc, suggested_amount_usdc, access_expiry_type, access_ip_binding, access_max_views, creator:creators(wallet_address)"
    )
    .eq("id", linkId)
    .eq("is_active", true)
    .eq("moderation_status", "approved")
    .single()

  if (error || !link) throw new Error("Link not found")

  const expectedAmount = resolveLinkAmount(link as MultichainLink)
  if (expectedAmount <= 0) throw new Error("Free links do not require payment")
  if (Math.abs(expectedAmount - amountUsdc) > 0.000001) {
    throw new Error("Payment amount does not match this link")
  }
  if (!getCreatorWallet(link as MultichainLink)) {
    throw new Error("Creator wallet is not configured")
  }

  return link as MultichainLink
}
