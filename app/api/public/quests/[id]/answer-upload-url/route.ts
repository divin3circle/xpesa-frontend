import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuid } from "uuid"

import { r2, R2_BUCKET } from "@/lib/r2"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"
import { getFileExtension, resolveMimeType } from "@/lib/links/file-policy"
import {
  ANSWER_MAX_BYTES,
  isAnswerExtensionAllowed,
  isAnswerMimeAllowed,
} from "@/lib/quests/answer-files"

const schema = z.object({
  attemptId: z.string().uuid(),
  fileName: z.string().trim().min(1).max(300),
  fileType: z.string().max(200).optional(),
  fileSizeBytes: z.number().int().positive(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const input = schema.parse(await request.json())

    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "quest_answer_upload",
      identity: `${id}:${input.attemptId}`,
      limit: 30,
      windowSeconds: 60,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    if (input.fileSizeBytes > ANSWER_MAX_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 10MB limit." },
        { status: 413 }
      )
    }

    const supabase = createAdminClient()
    const { data: quest } = await supabase
      .from("quests")
      .select("id, status")
      .eq("id", id)
      .single()
    if (!quest || quest.status !== "active") {
      return NextResponse.json({ error: "Quest is not active" }, { status: 400 })
    }

    const { data: attempt } = await supabase
      .from("quest_attempts")
      .select("id, status")
      .eq("id", input.attemptId)
      .eq("quest_id", id)
      .single()
    if (!attempt || attempt.status !== "started") {
      return NextResponse.json({ error: "Attempt is not open" }, { status: 400 })
    }

    const ext = getFileExtension(input.fileName)
    if (!ext || !isAnswerExtensionAllowed(ext)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }
    const contentType = resolveMimeType(input.fileName, input.fileType)
    if (!isAnswerMimeAllowed(contentType)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    const key = `quest-answers/${id}/${input.attemptId}/${uuid()}.${ext}`
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    })
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 900 })

    return NextResponse.json({ uploadUrl, key, contentType })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sign upload" },
      { status: 400 }
    )
  }
}
