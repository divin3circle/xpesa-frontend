import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { classifyFileByExtension } from "@/lib/links/file-policy"

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
    type: string
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

  const files =
    link.type === "pack"
      ? await getPackFiles(supabase, link.id, link.title)
      : [
          {
            id: link.id,
            name: link.title,
            type: classifyFileByExtension(link.document_r2_key ?? link.title),
            size: formatBytes(link.document_file_size_bytes),
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

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "Unknown"
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function getPackFiles(
  supabase: ReturnType<typeof createAdminClient>,
  linkId: string,
  title: string
) {
  const { data } = await supabase
    .from("pack_files")
    .select("id, original_filename, file_type, file_size_bytes, sort_order")
    .eq("link_id", linkId)
    .order("sort_order", { ascending: true })

  if (data?.length) {
    return data.map((file) => ({
      id: file.id,
      name: file.original_filename,
      type: file.file_type,
      size: formatBytes(file.file_size_bytes),
    }))
  }

  return [
    {
      id: linkId,
      name: title,
      type: "zip",
      size: "Unknown",
    },
  ]
}
