import type { Redis } from "@upstash/redis"

type RateLimitScope = "preview" | "download"

type RateLimitOptions = {
  redis: Redis
  scope: RateLimitScope
  tokenId: string
  walletAddress: string
  ipHash: string
  limit: number
  windowSeconds?: number
}

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
}

export async function checkRateLimit({
  redis,
  scope,
  tokenId,
  walletAddress,
  ipHash,
  limit,
  windowSeconds = 60,
}: RateLimitOptions): Promise<RateLimitResult> {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000))
  const key = `rate:${scope}:${tokenId}:${walletAddress}:${ipHash}:${bucket}`

  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, windowSeconds + 5)
  }

  const remaining = Math.max(limit - count, 0)

  return {
    allowed: count <= limit,
    limit,
    remaining,
    retryAfterSeconds: windowSeconds,
  }
}
