import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2, R2_BUCKET } from "@/lib/r2"
import { v4 as uuid } from "uuid"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { envConfig } from "@/lib/env"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

import {
  getExtension,
  isAllowedContentType,
  isAllowedExtension,
  isWithinSizeLimit,
  uploadPolicy,
  type UploadMode,
} from "../upload-policy"
import { resolveMimeType } from "@/lib/links/file-policy"

async function getCreatorStorageBytes(creatorId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("links")
    .select("document_file_size_bytes, pack_total_size_bytes")
    .eq("creator_id", creatorId)

  return (data ?? []).reduce((sum, link) => {
    return (
      sum +
      Number(link.document_file_size_bytes ?? 0) +
      Number(link.pack_total_size_bytes ?? 0)
    )
  }, 0)
}

export async function POST(request: Request) {
  try {
    const {
      creatorId,
      fileName,
      fileType,
      mode,
      fileSizeBytes,
    }: {
      creatorId?: string
      fileName?: string
      fileType?: string
      mode?: UploadMode
      fileSizeBytes?: number
    } = await request.json()

    if (!creatorId || !mode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "upload_sign",
      identity: creatorId,
      limit: envConfig.UPLOAD_RATE_LIMIT,
      windowSeconds: envConfig.UPLOAD_RATE_LIMIT_WINDOW_SECONDS,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    if (!(mode in uploadPolicy)) {
      return NextResponse.json({ error: "Unsupported mode" }, { status: 400 })
    }

    if (
      typeof fileSizeBytes === "number" &&
      !isWithinSizeLimit(mode, fileSizeBytes)
    ) {
      return NextResponse.json(
        {
          error: `File too large. Max size is ${uploadPolicy[mode].maxBytes} bytes.`,
        },
        { status: 413 }
      )
    }

    if (typeof fileSizeBytes === "number") {
      const currentStorageBytes = await getCreatorStorageBytes(creatorId)
      if (currentStorageBytes + fileSizeBytes > envConfig.MAX_CREATOR_STORAGE_BYTES) {
        return NextResponse.json(
          { error: "Creator storage quota exceeded" },
          { status: 413 }
        )
      }
    }

    let key: string
    let contentType: string

    if (mode === "pack" || mode === "document") {
      if (!fileName || !fileType) {
        return NextResponse.json(
          { error: "fileName and fileType are required for uploads" },
          { status: 400 }
        )
      }

      const ext = getExtension(fileName)
      if (!ext) {
        return NextResponse.json(
          { error: "Invalid fileName: missing extension" },
          { status: 400 }
        )
      }

      if (!isAllowedExtension(mode, ext)) {
        return NextResponse.json(
          { error: "Unsupported file extension" },
          { status: 400 }
        )
      }

      contentType = resolveMimeType(fileName, fileType)

      if (!isAllowedContentType(mode, contentType)) {
        return NextResponse.json(
          { error: "Unsupported file MIME type" },
          { status: 400 }
        )
      }

      key = `${uploadPolicy[mode].prefix}/${creatorId}/${uuid()}.${ext}`
    } else {
      return NextResponse.json({ error: "Unsupported mode" }, { status: 400 })
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 900 })

    return NextResponse.json({ uploadUrl, key, contentType })
  } catch (error) {
    console.error("Error generating upload URL:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
