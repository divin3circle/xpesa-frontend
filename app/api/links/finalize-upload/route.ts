import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { R2_BUCKET, r2 } from "@/lib/r2"
import {
  getExtension,
  hasExpectedPrefix,
  isAllowedContentType,
  isAllowedExtension,
  isWithinSizeLimit,
  normalizeContentType,
  uploadPolicy,
  type UploadMode,
} from "../upload-policy"

type FinalizeUploadBody = {
  creatorId?: string
  key?: string
  mode?: UploadMode
}

export async function POST(request: Request) {
  try {
    const { creatorId, key, mode }: FinalizeUploadBody = await request.json()

    if (!creatorId || !key || !mode) {
      return NextResponse.json(
        { error: "creatorId, key, and mode are required" },
        { status: 400 }
      )
    }

    if (!(mode in uploadPolicy)) {
      return NextResponse.json({ error: "Unsupported mode" }, { status: 400 })
    }

    if (!hasExpectedPrefix(mode, creatorId, key)) {
      return NextResponse.json(
        { error: "Uploaded key does not match creator or mode path" },
        { status: 403 }
      )
    }

    const extension = getExtension(key)
    if (!extension || !isAllowedExtension(mode, extension)) {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
        })
      )

      return NextResponse.json(
        { error: "Unsupported file extension for mode", deleted: true },
        { status: 422 }
      )
    }

    const head = await r2.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    )

    const normalizedContentType = normalizeContentType(head.ContentType)
    const fileSizeBytes = head.ContentLength ?? 0

    if (!isAllowedContentType(mode, normalizedContentType)) {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
        })
      )

      return NextResponse.json(
        { error: "Uploaded file content type is not allowed", deleted: true },
        { status: 422 }
      )
    }

    if (!isWithinSizeLimit(mode, fileSizeBytes)) {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
        })
      )

      return NextResponse.json(
        {
          error: `Uploaded file exceeds maximum allowed size (${uploadPolicy[mode].maxBytes} bytes)`,
          deleted: true,
        },
        { status: 413 }
      )
    }

    return NextResponse.json({
      success: true,
      r2Key: key,
      key,
      fileSizeBytes,
      contentType: normalizedContentType,
      mode,
    })
  } catch (error) {
    console.error("Error finalizing upload:", error)
    return NextResponse.json(
      { error: "Failed to finalize upload" },
      { status: 500 }
    )
  }
}
