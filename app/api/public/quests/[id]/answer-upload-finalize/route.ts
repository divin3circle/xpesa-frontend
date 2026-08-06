import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"

import { r2, R2_BUCKET } from "@/lib/r2"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"
import { normalizeMimeType } from "@/lib/links/file-policy"
import {
  ANSWER_MAX_BYTES,
  isAnswerMimeAllowed,
} from "@/lib/quests/answer-files"

const schema = z.object({
  attemptId: z.string().uuid(),
  key: z.string().trim().min(1).max(400),
  name: z.string().trim().min(1).max(300),
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

    const expectedPrefix = `quest-answers/${id}/${input.attemptId}/`
    if (!input.key.startsWith(expectedPrefix)) {
      return NextResponse.json({ error: "Key mismatch" }, { status: 403 })
    }

    const supabase = createAdminClient()
    const { data: attempt } = await supabase
      .from("quest_attempts")
      .select("id, status")
      .eq("id", input.attemptId)
      .eq("quest_id", id)
      .single()
    if (!attempt || attempt.status !== "started") {
      return NextResponse.json({ error: "Attempt is not open" }, { status: 400 })
    }

    const head = await r2.send(
      new HeadObjectCommand({ Bucket: R2_BUCKET, Key: input.key })
    )
    const size = Number(head.ContentLength ?? 0)
    const contentType = normalizeMimeType(head.ContentType)

    const invalid =
      size <= 0 || size > ANSWER_MAX_BYTES || !isAnswerMimeAllowed(contentType)
    if (invalid) {
      await r2
        .send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: input.key }))
        .catch(() => {})
      return NextResponse.json(
        { error: "Uploaded file failed validation" },
        { status: 422 }
      )
    }

    return NextResponse.json({
      key: input.key,
      name: input.name,
      size,
      type: contentType,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to finalize" },
      { status: 400 }
    )
  }
}
