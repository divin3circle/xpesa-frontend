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
  const { walletAddress, signingWalletAddress, signature, pageNums } =
    await request.json()

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

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select("title, document_page_count, document_r2_key")
    .eq("id", token.link_id)
    .single()

  if (linkError || !link || !link.document_r2_key) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const requestedPages =
    Array.isArray(pageNums) && pageNums.length > 0
      ? pageNums
      : Array.from(
          { length: Math.max(link.document_page_count ?? 1, 1) },
          (_, index) => index + 1
        )

  const pages = requestedPages.map((pageNum: number) => {
    return `/api/previews/${tokenId}?page=${pageNum}`
  })

  return Response.json({ pages })
}
