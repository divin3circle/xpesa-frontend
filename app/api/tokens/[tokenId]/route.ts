import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export interface TokenResponse {
  token: {
    id: string
    fanWalletAddress: string
    expiresAt: string
  }
  link: {
    id: string
    type: "document" | "pack"
    title: string
    description: string | null
  }
  files: {
    id: string
    name: string
    type: "document" | "pack" | "gate" | "tip"
    size: string
  }[]
  previewUrl: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const supabase = createAdminClient()
  const { tokenId } = await params

  const cached = await redis.get(`access:${tokenId}`)
  if (!cached) {
    return Response.json({ error: "expired" }, { status: 403 })
  }

  const { data: token, error: tokenError } = await supabase
    .from("access_tokens")
    .select("link_id, fan_wallet_address, expires_at, max_views, view_count")
    .eq("id", tokenId)
    .single()

  if (tokenError || !token) {
    return Response.json({ error: "Token not found" }, { status: 404 })
  }

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select(
      "id, type, title, description, document_file_size_bytes, document_r2_key, pack_file_count"
    )
    .eq("id", token.link_id)
    .single()

  if (linkError || !link) {
    return Response.json({ error: "Link not found" }, { status: 404 })
  }

  let files: { id: string; name: string; type: string; size: string }[] = []
  files = [
    {
      id: link.id,
      name: link.title,
      type: "zip",
      size: link.document_file_size_bytes
        ? `${(link.document_file_size_bytes / 1024 / 1024).toFixed(1)} MB`
        : "Unknown",
    },
  ]

  return Response.json({
    token: {
      id: tokenId,
      fanWalletAddress: token.fan_wallet_address,
      expiresAt: token.expires_at,
    },
    link: {
      id: link.id,
      type: link.type,
      title: link.title,
      description: link.description,
    },
    files,
    previewUrl: `/api/previews/${tokenId}`,
  })
}
