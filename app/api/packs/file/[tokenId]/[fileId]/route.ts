import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { cookies } from "next/headers"

import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { verifyMessage } from "viem"

import { r2, R2_BUCKET } from "@/lib/r2"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"
import {
  getRequestIp,
  hashIp,
  normalizeAddress,
  withinGraceWindow,
} from "@/lib/view-access"

const redis = Redis.fromEnv()
const PREVIEW_COOKIE_NAME = "xpesa_preview_session"
const PREVIEW_SESSION_PREFIX = "preview-session:"

async function getPackFileUrl(tokenId: string, fileId: string) {
  const supabase = createAdminClient()

  const cached = await redis.get(`access:${tokenId}`)
  if (!cached) {
    return Response.json({ error: "expired" }, { status: 403 })
  }

  const { data: token, error } = await supabase
    .from("access_tokens")
    .select("id, link_id")
    .eq("id", tokenId)
    .single()

  if (error || !token) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const { data: file, error: fileError } = await supabase
    .from("pack_files")
    .select("r2_key, file_type, mime_type, original_filename")
    .eq("id", fileId)
    .eq("link_id", token.link_id)
    .single()

  if (fileError || !file) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: file.r2_key,
  })

  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 120 })

  return Response.json({
    signedUrl,
    fileType: file.file_type,
    mimeType: file.mime_type,
    filename: file.original_filename,
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tokenId: string; fileId: string }> }
) {
  const { tokenId, fileId } = await params
  const previewSession = (await cookies()).get(PREVIEW_COOKIE_NAME)?.value
  if (!previewSession) {
    return Response.json({ error: "expired" }, { status: 403 })
  }

  const previewSessionToken = await redis.get<string>(
    `${PREVIEW_SESSION_PREFIX}${previewSession}`
  )
  if (previewSessionToken !== tokenId) {
    return Response.json({ error: "expired" }, { status: 403 })
  }

  const rateLimit = await checkSensitiveRateLimit({
    request: _request,
    scope: "pack_file",
    identity: `${tokenId}:${fileId}`,
  })
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

  return getPackFileUrl(tokenId, fileId)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tokenId: string; fileId: string }> }
) {
  const supabase = createAdminClient()
  const { tokenId, fileId } = await params
  const { walletAddress, signingWalletAddress, signature } =
    await request.json()
  const isTokenOnlyAccess =
    String(walletAddress ?? "").startsWith("kotani:") ||
    String(walletAddress ?? "").startsWith("free:")

  const cached = await redis.get(`access:${tokenId}`)
  if (!cached) {
    return Response.json({ error: "expired" }, { status: 403 })
  }

  const { data: token, error } = await supabase
    .from("access_tokens")
    .select(
      "id, link_id, fan_wallet_address, view_count, last_accessed_at, bound_ip_hash, max_views, link:links(type)"
    )
    .eq("id", tokenId)
    .single()

  if (error || !token) {
    return Response.json({ error: "not_found" }, { status: 404 })
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
    const currentIpHash = hashIp(getRequestIp(request))
    if (
      currentIpHash !== token.bound_ip_hash &&
      !withinGraceWindow(token.last_accessed_at)
    ) {
      return Response.json({ error: "ip_mismatch" }, { status: 403 })
    }
  }

  if (token.max_views && token.view_count >= token.max_views) {
    return Response.json({ error: "view_limit_reached" }, { status: 403 })
  }

  const { data: file, error: fileError } = await supabase
    .from("pack_files")
    .select("r2_key, file_type, mime_type")
    .eq("id", fileId)
    .eq("link_id", token.link_id)
    .single()

  if (fileError || !file) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: file.r2_key,
  })

  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 30 })

  return Response.json({
    signedUrl,
    fileType: file.file_type,
    mimeType: file.mime_type,
  })
}
