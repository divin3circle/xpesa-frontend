import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { verifyMessage } from "viem"
import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

import { envConfig } from "@/lib/utils"
import { normalizeAddress } from "@/lib/view-access"

const redis = Redis.fromEnv()
const PREVIEW_COOKIE_NAME = "xpesa_preview_session"
const PREVIEW_SESSION_PREFIX = "preview-session:"

export interface PageAccessResponse {
  title: string
  pageCount: number | null
  watermarkEnabled: boolean
  downloadBlocked: boolean
  linkId: string
  requiredWallet: string
  viewsRemaining: number | null
  expiresIn: number | null
  previewSessionExpiresAt: string
  previewUrl: string
}

function buildResponse(body: PageAccessResponse, sessionId: string) {
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

  if (!walletAddress || !signature) {
    return Response.json(
      { error: "Missing wallet address or signature" },
      { status: 400 }
    )
  }

  const cached = await redis.get(`access:${tokenId}`)
  if (!cached) {
    console.warn(`[docs/open] Access token ${tokenId} not found in Redis cache`)
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
    console.warn(`[docs/open] Token ${tokenId} not found in DB`, error)
    return Response.json(
      { error: "Not found", detail: "Your token not found in our systems." },
      { status: 404 }
    )
  }

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select(
      "title, document_page_count, doc_watermark_enabled, doc_download_blocked, access_ip_binding, access_max_views, document_r2_key"
    )
    .eq("id", token.link_id)
    .single()

  if (linkError || !link) {
    console.warn(`[docs/open] Link ${token.link_id} not found in DB`, linkError)
    return Response.json(
      { error: "not_found", detail: "link_not_found" },
      { status: 404 }
    )
  }

  const verificationAddress = (signingWalletAddress ??
    walletAddress) as `0x${string}`

  const isValidSignature = await verifyMessage({
    address: verificationAddress,
    message: `xpesa-open:${tokenId}`,
    signature: signature as `0x${string}`,
  })

  if (
    !isValidSignature ||
    normalizeAddress(walletAddress) !==
      normalizeAddress(token.fan_wallet_address)
  ) {
    console.warn(
      `[docs/open] Signature or wallet mismatch for token ${tokenId}`,
      {
        isValidSignature,
        providedWallet: walletAddress,
        requiredWallet: token.fan_wallet_address,
      }
    )
    return Response.json(
      {
        error: "Wrong wallet",
        requiredWallet: token.fan_wallet_address,
      },
      { status: 403 }
    )
  }

  if (token.max_views && token.view_count >= token.max_views) {
    return Response.json({ error: "View limit reached" }, { status: 403 })
  }

  await supabase
    .from("access_tokens")
    .update({
      view_count: (token.view_count ?? 0) + 1,
      last_accessed_at: new Date().toISOString(),
    })
    .eq("id", tokenId)

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
      pageCount: link.document_page_count,
      watermarkEnabled: Boolean(link.doc_watermark_enabled),
      downloadBlocked: Boolean(link.doc_download_blocked),
      linkId: token.link_id,
      requiredWallet: token.fan_wallet_address,
      viewsRemaining:
        typeof token.max_views === "number"
          ? Math.max(token.max_views - (token.view_count ?? 0) - 1, 0)
          : null,
      expiresIn: null,
      previewSessionExpiresAt: new Date(
        Date.now() + envConfig.PREVIEW_SESSION_MAX_AGE_SECONDS * 1000
      ).toISOString(),
      previewUrl: `/api/previews/${tokenId}`,
    },
    sessionId
  )
}
