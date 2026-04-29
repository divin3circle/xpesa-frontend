import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { verifyMessage } from "viem"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { r2, R2_BUCKET } from "@/lib/r2"
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
  signedUrl: string
}

const redis = Redis.fromEnv()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const supabase = createAdminClient()
  const { tokenId } = await params
  const { walletAddress, signingWalletAddress, signature } =
    await request.json()

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

  const { data: packFiles, error: packFilesError } = await supabase
    .from("pack_files")
    .select("id, original_filename, file_type, sort_order")
    .eq("link_id", token.link_id)
    .order("sort_order", { ascending: true })

  if (packFilesError) {
    return Response.json({ error: "pack_files_query_error" }, { status: 500 })
  }

  let packSignedUrl = ""
  if (link.document_r2_key) {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: link.document_r2_key,
      })
      packSignedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })
    } catch (err) {
      console.error("Failed to generate pack signed URL", err)
      return Response.json(
        { error: "signed_url_generation_failed" },
        { status: 500 }
      )
    }
  }

  return Response.json({
    title: link.title,
    files: packFiles ?? [],
    watermarkEnabled: true,
    expiresAt: null,
    viewsRemaining:
      typeof token.max_views === "number"
        ? Math.max(token.max_views - (token.view_count ?? 0) - 1, 0)
        : null,
    signedUrl: packSignedUrl,
  })
}
