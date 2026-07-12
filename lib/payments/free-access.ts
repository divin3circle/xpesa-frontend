import { randomUUID } from "crypto"
import { Redis } from "@upstash/redis"

type SupabaseAdminClient = ReturnType<
  typeof import("@/lib/supabase/admin").createAdminClient
>

type FreeAccessLink = {
  id: string
  type: string
  price_usdc: number | string | null
  suggested_amount_usdc: number | string | null
}

const redis = Redis.fromEnv()

function asNumber(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

export function getResolvedLinkAmount(link: FreeAccessLink) {
  return asNumber(link.suggested_amount_usdc ?? link.price_usdc)
}

export function isFreeAccessLink(link: FreeAccessLink) {
  return getResolvedLinkAmount(link) <= 0
}

export async function createFreeAccessToken({
  supabase,
  link,
}: {
  supabase: SupabaseAdminClient
  link: FreeAccessLink
}) {
  const tokenId = randomUUID()

  const { error } = await supabase.from("access_tokens").insert({
    id: tokenId,
    transaction_id: null,
    link_id: link.id,
    fan_wallet_address: `free:${randomUUID()}`,
    expires_at: null,
    is_one_time: false,
    bound_ip_hash: null,
    max_views: null,
  })

  if (error) {
    if (
      error.message
        ?.toLowerCase()
        .includes('null value in column "transaction_id"')
    ) {
      throw new Error(
        "Free access setup incomplete: make access_tokens.transaction_id nullable."
      )
    }

    throw new Error(error.message)
  }

  await redis.set(`access:${tokenId}`, link.id)

  return {
    accessToken: tokenId,
    linkType: link.type,
  }
}
