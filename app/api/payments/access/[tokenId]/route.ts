import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { decrypt } from "@/lib/encryption"

const redis = Redis.fromEnv()

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

  const { data: token, error } = await supabase
    .from("access_tokens")
    .select("id, link_id, is_one_time, used_at")
    .eq("id", tokenId)
    .single()

  if (error || !token) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select("type, destination_url")
    .eq("id", token.link_id)
    .single()

  if (linkError || !link) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  if (link.type !== "gate") {
    return Response.json({ error: "wrong_type" }, { status: 404 })
  }

  if (token.is_one_time && token.used_at) {
    return Response.json({ error: "already_used" }, { status: 403 })
  }

  const destinationUrl = link.destination_url
    ? decrypt(link.destination_url)
    : ""

  if (!destinationUrl) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  if (token.is_one_time) {
    await redis.del(`access:${tokenId}`)
    await supabase
      .from("access_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenId)
  }

  return Response.json({ destinationUrl })
}
