import { NextResponse } from "next/server"
import { z } from "zod"

import { envConfig } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getCreatorIdForUser } from "@/lib/quests/server"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

const generatedQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      type: z.enum(["multiple_choice", "true_false"]),
      prompt: z.string().min(1).max(500),
      options: z.array(z.string().min(1).max(160)).min(2).max(4),
      correctAnswer: z.string().min(1).max(160),
      explanation: z.string().max(500).optional(),
      points: z.number().int().min(1).max(10).default(1),
    })
  ).min(3).max(10),
})

async function requireOwnedQuest(questId: string) {
  const auth = await createClient()
  const { data } = await auth.auth.getUser()
  if (!data.user) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const creatorId = await getCreatorIdForUser(supabase, data.user.id)
  const { data: quest } = await supabase
    .from("quests")
    .select("id,title,description,link:links(title,description,type)")
    .eq("id", questId)
    .eq("creator_id", creatorId)
    .single()

  if (!quest) throw new Error("Quest not found")
  return quest
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!envConfig.OPENAI_API_KEY) throw new Error("OpenAI is not configured")
    const { id } = await params
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "quest_ai",
      identity: id,
      limit: 6,
      windowSeconds: 300,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const quest = await requireOwnedQuest(id)
    const link = Array.isArray(quest.link) ? quest.link[0] : quest.link

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${envConfig.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "Generate auto-scored quiz draft JSON only. Use multiple_choice or true_false questions.",
          },
          {
            role: "user",
            content: `Quest: ${quest.title}\nContent: ${link?.title}\nDescription: ${link?.description ?? quest.description ?? ""}`,
          },
        ],
        text: { format: { type: "json_object" } },
      }),
    })

    const payload = await response.json()
    const text = payload.output_text ?? payload.output?.[0]?.content?.[0]?.text
    const parsed = generatedQuestionsSchema.parse(JSON.parse(String(text)))
    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate quest" },
      { status: 400 }
    )
  }
}
