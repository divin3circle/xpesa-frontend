import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

import { envConfig } from "@/lib/env"
import { getRequestIp, hashIp } from "@/lib/view-access"

const redis = Redis.fromEnv()

export type SensitiveRateLimitScope =
  | "payment_confirm"
  | "payment_intent"
  | "payment_multichain"
  | "receipt_mint"
  | "pack_file"
  | "upload_sign"
  | "upload_finalize"

type SensitiveRateLimitOptions = {
  request: Request
  scope: SensitiveRateLimitScope
  identity?: string | null
  limit?: number
  windowSeconds?: number
}

export async function checkSensitiveRateLimit({
  request,
  scope,
  identity,
  limit = envConfig.SENSITIVE_ROUTE_RATE_LIMIT,
  windowSeconds = envConfig.SENSITIVE_ROUTE_RATE_LIMIT_WINDOW_SECONDS,
}: SensitiveRateLimitOptions) {
  const ipHash = hashIp(getRequestIp(request))
  const actor = identity?.trim() || "anonymous"
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000))
  const key = `rate:${scope}:${actor}:${ipHash}:${bucket}`

  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, windowSeconds + 5)

  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(limit - count, 0),
    retryAfterSeconds: windowSeconds,
  }
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "rate_limited", retryAfterSeconds },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  )
}
