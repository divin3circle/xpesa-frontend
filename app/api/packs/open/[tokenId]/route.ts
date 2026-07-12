import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { verifyMessage } from "viem"
import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

import { envConfig } from "@/lib/env"
import { normalizeAddress } from "@/lib/view-access"

export interface PackAccessResponse {
  title: string
  files: {
    id: string
    original_filename: string
    file_type: string
    sort_order: number
  }[]
  watermarkEnabled: boolean
  expiresAt: string | null
  viewsRemaining: number | null
  previewSessionExpiresAt: string
  previewUrl: string
}

const redis = Redis.fromEnv()
const PREVIEW_COOKIE_NAME = "xpesa_preview_session"
const PREVIEW_SESSION_PREFIX = "preview-session:"

function buildResponse(body: PackAccessResponse, sessionId: string) {
  const response = NextResponse.json(body)
  response.cookies.set(PREVIEW_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: envConfig.PREVIEW_SESSION_MAX_AGE_SECONDS,
  })
  return response
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const supabase = createAdminClient()
  const { tokenId } = await params
  const { walletAddress, signingWalletAddress, signature } =
    await request.json()
  const isTokenOnlyAccess =
    String(walletAddress ?? "").startsWith("kotani:") ||
    String(walletAddress ?? "").startsWith("free:")

  const cached = await redis.get(`access:${tokenId}`)
  if (!cached) {
    console.warn(
      `[packs/open] Access token ${tokenId} not found in Redis cache`
    )
    return Response.json(
      { error: "expired", detail: "token_not_in_cache" },
      { status: 403 }
    )
  }

  const { data: token, error } = await supabase
    .from("access_tokens")
    .select(
      "id, link_id, fan_wallet_address, view_count, last_accessed_at, bound_ip_hash, max_views"
    )
    .eq("id", tokenId)
    .single()

  if (error || !token) {
    console.warn(`[packs/open] Token ${tokenId} not found in DB`, error)
    return Response.json(
      { error: "not_found", detail: "token_not_in_db" },
      { status: 404 }
    )
  }

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select(
      "title, pack_file_count, pack_total_size_bytes, access_ip_binding, access_max_views, document_r2_key"
    )
    .eq("id", token.link_id)
    .single()

  if (linkError || !link) {
    console.warn(
      `[packs/open] Link ${token.link_id} not found in DB`,
      linkError
    )
    return Response.json(
      { error: "not_found", detail: "link_not_found" },
      { status: 404 }
    )
  }

  let isValidSignature = true
  if (!isTokenOnlyAccess) {
    const verificationAddress = (signingWalletAddress ??
      walletAddress) as `0x${string}`

    isValidSignature = await verifyMessage({
      address: verificationAddress,
      message: `xpesa-open:${tokenId}`,
      signature: signature as `0x${string}`,
    })
  }

  if (
    !isValidSignature ||
    normalizeAddress(walletAddress) !== normalizeAddress(token.fan_wallet_address)
  ) {
    console.warn(
      `[packs/open] Signature or wallet mismatch for token ${tokenId}`,
      {
        isValidSignature,
        providedWallet: walletAddress,
        requiredWallet: token.fan_wallet_address,
      }
    )
    return Response.json(
      {
        error: "wrong_wallet",
        requiredWallet: token.fan_wallet_address,
      },
      { status: 403 }
    )
  }

  if (token.max_views && token.view_count >= token.max_views) {
    return Response.json({ error: "view_limit_reached" }, { status: 403 })
  }

  await supabase
    .from("access_tokens")
    .update({
      view_count: (token.view_count ?? 0) + 1,
      last_accessed_at: new Date().toISOString(),
    })
    .eq("id", tokenId)

  const declaredCount = Number(link.pack_file_count ?? 0)
  const packFiles =
    declaredCount > 0
      ? Array.from({ length: declaredCount }, (_, index) => ({
          id: `${token.link_id}-pack-item-${index + 1}`,
          original_filename: `Pack file ${index + 1}`,
          file_type: "pack",
          sort_order: index + 1,
        }))
      : []

  if (!link.document_r2_key) {
    return NextResponse.json(
      { error: "signed_url_generation_failed" },
      { status: 500 }
    )
  }

  const sessionId = randomUUID()
  await redis.set(`${PREVIEW_SESSION_PREFIX}${sessionId}`, tokenId, {
    ex: envConfig.PREVIEW_SESSION_MAX_AGE_SECONDS,
  })

  return buildResponse(
    {
      title: link.title,
      files: packFiles ?? [],
      watermarkEnabled: true,
      expiresAt: null,
      viewsRemaining:
        typeof token.max_views === "number"
          ? Math.max(token.max_views - (token.view_count ?? 0) - 1, 0)
          : null,
      previewSessionExpiresAt: new Date(
        Date.now() + envConfig.PREVIEW_SESSION_MAX_AGE_SECONDS * 1000
      ).toISOString(),
      previewUrl: `/api/previews/${tokenId}`,
    },
    sessionId
  )
}
