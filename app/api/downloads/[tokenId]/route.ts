import { GetObjectCommand } from "@aws-sdk/client-s3"
import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"
import { Readable } from "node:stream"
import { cookies } from "next/headers"

import { r2, R2_BUCKET } from "@/lib/r2"
import { checkRateLimit } from "@/lib/rate-limit"
import { getRequestIp, hashIp } from "@/lib/view-access"
import { envConfig } from "@/lib/utils"

const redis = Redis.fromEnv()
const PREVIEW_COOKIE_NAME = "xpesa_preview_session"
const PREVIEW_SESSION_PREFIX = "preview-session:"

function sanitizeFilename(name: string) {
  return name.replace(/["\r\n]/g, "_")
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const supabase = createAdminClient()
  const { tokenId } = await params
  const cookieStore = await cookies()

  const previewSession = cookieStore.get(PREVIEW_COOKIE_NAME)?.value
  if (!previewSession) {
    return Response.json({ error: "expired" }, { status: 403 })
  }

  const previewSessionToken = await redis.get<string>(
    `${PREVIEW_SESSION_PREFIX}${previewSession}`
  )
  if (previewSessionToken !== tokenId) {
    return Response.json({ error: "expired" }, { status: 403 })
  }

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
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select(
      "id, type, title, description, document_r2_key, document_file_size_bytes, pack_total_size_bytes"
    )
    .eq("id", token.link_id)
    .single()

  if (linkError || !link || !link.document_r2_key) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const clientIp = getRequestIp(request)
  const rateLimit = await checkRateLimit({
    redis,
    scope: "download",
    tokenId,
    walletAddress: token.fan_wallet_address,
    ipHash: hashIp(clientIp),
    limit: envConfig.DOWNLOAD_RATE_LIMIT,
    windowSeconds: envConfig.DOWNLOAD_RATE_LIMIT_WINDOW_SECONDS,
  })

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "rate_limited",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    )
  }

  await supabase
    .from("access_tokens")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("id", tokenId)

  try {
    const object = await r2.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: link.document_r2_key,
      })
    )

    if (!object.Body) {
      return Response.json({ error: "download_failed" }, { status: 500 })
    }

    const bodyStream =
      object.Body instanceof Readable
        ? Readable.toWeb(object.Body)
        : (object.Body as ReadableStream)

    const fileName = sanitizeFilename(
      link.type === "pack"
        ? `${link.title || "pack"}.zip`
        : link.title || "document"
    )

    const headers = new Headers({
      "Cache-Control": "no-store, max-age=0",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type":
        (object.ContentType as string) || "application/octet-stream",
    })

    const size =
      link.type === "pack"
        ? (link.pack_total_size_bytes ?? object.ContentLength)
        : (link.document_file_size_bytes ?? object.ContentLength)

    if (typeof size === "number" && Number.isFinite(size)) {
      headers.set("Content-Length", String(size))
    }

    return new Response(bodyStream as unknown as BodyInit, { headers })
  } catch (err) {
    console.error("Failed to stream download", err)
    return Response.json({ error: "download_failed" }, { status: 500 })
  }
}
