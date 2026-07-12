import { randomUUID } from "crypto"
import crypto from "crypto"
import { Redis } from "@upstash/redis"

type SupabaseAdminClient = ReturnType<
  typeof import("@/lib/supabase/admin").createAdminClient
>

type LinkForAccess = {
  id: string
  creator_id: string
  type: string
  access_expiry_type: string | null
  access_ip_binding: boolean | null
  access_max_views: number | null
}

type CreateAccessForPaymentParams = {
  supabase: SupabaseAdminClient
  link: LinkForAccess
  fanWalletAddress: string
  txHash: string | null
  network: string
  amountUsdc: number
  platformFeeUsdc: number
  creatorNetUsdc: number
  requestHeaders: Headers
  paymentIntentId?: string | null
  paymentMethod?: string | null
}

const redis = Redis.fromEnv()

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex")
}

export function calculateAccessExpiry(expiryType: string | null): string | null {
  const now = new Date()
  const map: Record<string, number> = {
    "5m": 5 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  }
  if (!expiryType || expiryType === "forever" || expiryType === "one_time") {
    return null
  }
  const ms = map[expiryType]
  if (!ms) return null
  return new Date(now.getTime() + ms).toISOString()
}

function getRequestIp(headers: Headers) {
  return headers.get("x-forwarded-for") ?? ""
}

export async function createAccessForConfirmedPayment({
  supabase,
  link,
  fanWalletAddress,
  txHash,
  network,
  amountUsdc,
  platformFeeUsdc,
  creatorNetUsdc,
  requestHeaders,
  paymentIntentId,
  paymentMethod,
}: CreateAccessForPaymentParams) {
  const transactionInsert: Record<string, unknown> = {
    link_id: link.id,
    creator_id: link.creator_id,
    fan_wallet_address: fanWalletAddress,
    tx_hash: txHash,
    network,
    amount_usdc: amountUsdc,
    platform_fee_usdc: platformFeeUsdc,
    creator_net_usdc: creatorNetUsdc,
    status: "confirmed",
    fan_ip_hash: hashIp(getRequestIp(requestHeaders)),
  }

  if (paymentIntentId) transactionInsert.payment_intent_id = paymentIntentId
  if (paymentMethod) transactionInsert.payment_method = paymentMethod

  const { data: insertedTransaction, error: transactionError } = await supabase
    .from("transactions")
    .insert(transactionInsert)
    .select()
    .single()

  if (transactionError || !insertedTransaction) {
    throw new Error(transactionError?.message || "Failed to record transaction")
  }

  await supabase.rpc("increment_link_stats", {
    p_link_id: link.id,
    p_amount: amountUsdc,
  })

  const tokenId = randomUUID()
  const expiresAt = calculateAccessExpiry(link.access_expiry_type)
  const ipHash = link.access_ip_binding
    ? hashIp(getRequestIp(requestHeaders))
    : null

  const { error: accessTokenError } = await supabase.from("access_tokens").insert({
    id: tokenId,
    transaction_id: insertedTransaction.id,
    link_id: link.id,
    fan_wallet_address: fanWalletAddress,
    expires_at: expiresAt,
    is_one_time: link.access_expiry_type === "one_time",
    bound_ip_hash: ipHash,
    max_views: link.access_max_views,
  })

  if (accessTokenError) {
    throw new Error(accessTokenError.message)
  }

  const ttl = expiresAt
    ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    : null

  if (ttl && ttl > 0) {
    await redis.set(`access:${tokenId}`, link.id, { ex: ttl })
  } else if (!expiresAt) {
    await redis.set(`access:${tokenId}`, link.id)
  }

  return {
    accessToken: tokenId,
    transactionId: insertedTransaction.id as string,
    linkType: link.type,
  }
}
