import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { verifyMessage } from "viem"

import { r2, R2_BUCKET } from "@/lib/r2"
import {
  getRequestIp,
  hashIp,
  normalizeAddress,
  withinGraceWindow,
} from "@/lib/view-access"

const redis = Redis.fromEnv()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tokenId: string; fileId: string }> }
) {
  const supabase = createAdminClient()
  const { tokenId, fileId } = await params
  const { walletAddress, signature } = await request.json()

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
