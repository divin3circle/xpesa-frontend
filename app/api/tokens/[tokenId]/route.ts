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
    return Response.json({ error: "token_not_found" }, { status: 404 })
  }

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select("id, type, title, description, document_file_size_bytes")
    .eq("id", token.link_id)
    .single()

  if (linkError || !link) {
    return Response.json({ error: "link_not_found" }, { status: 404 })
  }

  let files: { id: string; name: string; type: string; size: string }[] = []
  if (link.type === "pack") {
    const { data: packFiles } = await supabase
      .from("pack_files")
      .select("id, original_filename, file_type, file_size_bytes")
      .eq("link_id", link.id)
      .order("sort_order", { ascending: true })

    files =
      packFiles?.map((f) => ({
        id: f.id,
        name: f.original_filename,
        type: f.file_type,
        size: f.file_size_bytes
          ? `${(f.file_size_bytes / 1024 / 1024).toFixed(1)} MB`
          : "Unknown",
      })) || []
  } else if (link.type === "document") {
    files = [
      {
        id: link.id,
        name: link.title,
        type: "pdf", // Default for document type
        size: link.document_file_size_bytes
          ? `${(link.document_file_size_bytes / 1024 / 1024).toFixed(1)} MB`
          : "Unknown",
      },
    ]
  }

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
  })
}
