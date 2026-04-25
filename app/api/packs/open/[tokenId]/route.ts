import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { verifyMessage } from "viem"

import {
  getRequestIp,
  hashIp,
  normalizeAddress,
  withinGraceWindow,
} from "@/lib/view-access"

const redis = Redis.fromEnv()

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
      "title, pack_file_count, pack_total_size_bytes, access_ip_binding, access_max_views"
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

  return Response.json({
    title: link.title,
    files: packFiles ?? [],
    watermarkEnabled: true,
    expiresAt: null,
    viewsRemaining:
      typeof token.max_views === "number"
        ? Math.max(token.max_views - (token.view_count ?? 0) - 1, 0)
        : null,
  })
}
