import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2, R2_BUCKET } from "@/lib/r2"
import { v4 as uuid } from "uuid"
import { NextResponse } from "next/server"

import {
  getExtension,
  isAllowedContentType,
  isAllowedExtension,
  isWithinSizeLimit,
  uploadPolicy,
  type UploadMode,
} from "../upload-policy"

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

    let key: string
    let contentType: string

    if (mode === "pack") {
      key = `packs/${creatorId}/${uuid()}.zip`
      contentType = "application/zip"

      if (fileType && !isAllowedContentType(mode, fileType)) {
        return NextResponse.json(
          { error: "Pack uploads must use application/zip" },
          { status: 400 }
        )
      }
    } else if (mode === "document") {
      if (!fileName || !fileType) {
        return NextResponse.json(
          { error: "fileName and fileType are required for document uploads" },
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
          { error: "Unsupported document extension" },
          { status: 400 }
        )
      }

      if (!isAllowedContentType(mode, fileType)) {
        return NextResponse.json(
          { error: "Unsupported document MIME type" },
          { status: 400 }
        )
      }

      key = `documents/${creatorId}/${uuid()}.${ext}`
      contentType = fileType
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
