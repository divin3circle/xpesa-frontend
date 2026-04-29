import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { verifyMessage } from "viem"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { r2, R2_BUCKET } from "@/lib/r2"
import {
  getRequestIp,
  hashIp,
  normalizeAddress,
  withinGraceWindow,
} from "@/lib/view-access"

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
  const { walletAddress, signature } = await request.json()

  const cached = await redis.get(`access:${tokenId}`)
  if (!cached) {
    return Response.json({ error: "expired" }, { status: 403 })
  }

  const { data: token, error } = await supabase
    .from("access_tokens")
    .select(
      "id, link_id, fan_wallet_address, view_count, last_accessed_at, bound_ip_hash, max_views"
    )
    .eq("id", tokenId)
    .single()

  if (error || !token) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select(
      "title, document_page_count, doc_watermark_enabled, doc_download_blocked, access_ip_binding, access_max_views, document_r2_key"
    )
    .eq("id", token.link_id)
    .single()

  if (linkError || !link) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const isValidSignature = await verifyMessage({
    address: walletAddress as `0x${string}`,
    message: `xpesa-open:${tokenId}`,
    signature: signature as `0x${string}`,
  })

  if (
    !isValidSignature ||
    normalizeAddress(walletAddress) !==
      normalizeAddress(token.fan_wallet_address)
  ) {
    return Response.json(
      {
        error: "wrong_wallet",
        requiredWallet: token.fan_wallet_address,
      },
      { status: 403 }
    )
  }

  if (token.bound_ip_hash) {
    const requestIp = getRequestIp(request)
    const currentIpHash = hashIp(requestIp)
    const ipChanged = currentIpHash !== token.bound_ip_hash

    if (ipChanged && !withinGraceWindow(token.last_accessed_at)) {
      return Response.json({ error: "ip_mismatch" }, { status: 403 })
    }
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
