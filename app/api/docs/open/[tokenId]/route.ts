import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { verifyMessage } from "viem"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { r2, R2_BUCKET } from "@/lib/r2"
import { normalizeAddress } from "@/lib/view-access"

const redis = Redis.fromEnv()

export interface PageAccessResponse {
  title: string
  pageCount: number | null
  watermarkEnabled: boolean
  downloadBlocked: boolean
  linkId: string
  requiredWallet: string
  viewsRemaining: number | null
  expiresIn: number | null
  signedUrl: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const supabase = createAdminClient()
  const { tokenId } = await params
  const { walletAddress, signingWalletAddress, signature } = await request.json()

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

  const verificationAddress =
    (signingWalletAddress ?? walletAddress) as `0x${string}`

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

  let signedUrl = ""
  if (link.document_r2_key) {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: link.document_r2_key,
      })
      signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })
    } catch (err) {
      console.error("Failed to generate signed URL", err)
      return Response.json(
        { error: "signed_url_generation_failed" },
        { status: 500 }
      )
    }
  }

  return Response.json({
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
    signedUrl,
  })
}
