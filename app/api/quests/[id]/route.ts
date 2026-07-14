import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getCreatorIdForUser } from "@/lib/quests/server"

const updateQuestSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(240).nullable().optional(),
  status: z.enum(["draft", "active", "ended"]).optional(),
  maxAttempts: z.coerce.number().int().min(1).max(5).optional(),
  rewardMode: z.enum(["none", "top_1", "top_3"]).optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  leaderboardVisible: z.boolean().optional(),
  questions: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        type: z.enum(["multiple_choice", "true_false", "open_ended"]),
        prompt: z.string().trim().min(1).max(500),
        options: z.array(z.string().trim().min(1).max(160)).max(4),
        correctAnswer: z.string().trim().max(160),
        explanation: z.string().trim().max(500).optional(),
        points: z.coerce.number().int().min(1).max(10).default(1),
      }).superRefine((question, ctx) => {
        if (question.type === "open_ended") return
        if (question.options.length < 2) {
          ctx.addIssue({
            code: "custom",
            message: "Multiple-choice questions need at least two options",
            path: ["options"],
          })
        }
        if (!question.correctAnswer) {
          ctx.addIssue({
            code: "custom",
            message: "Multiple-choice questions need a correct answer",
            path: ["correctAnswer"],
          })
        }
      })
    )
    .optional(),
})

async function requireOwnedQuest(questId: string) {
  const auth = await createClient()
  const { data } = await auth.auth.getUser()
  if (!data.user) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const creatorId = await getCreatorIdForUser(supabase, data.user.id)
  const { data: quest, error } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("creator_id", creatorId)
    .single()

  if (error || !quest) throw new Error("Quest not found")
  return { supabase, quest }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const input = updateQuestSchema.parse(await request.json())
    const { supabase, quest } = await requireOwnedQuest(id)

    const { questions, ...questPatch } = input
    const update = Object.fromEntries(
      Object.entries({
        title: questPatch.title,
        description: questPatch.description,
        status: questPatch.status,
        max_attempts: questPatch.maxAttempts,
        reward_mode: questPatch.rewardMode,
        starts_at: questPatch.startsAt,
        ends_at: questPatch.endsAt,
        leaderboard_visible: questPatch.leaderboardVisible,
        updated_at: new Date().toISOString(),
      }).filter(([, value]) => value !== undefined)
    )

    const { data, error } = await supabase
      .from("quests")
      .update(update)
      .eq("id", quest.id)
      .select()
      .single()
    if (error) throw error

    if (questions) {
      await supabase.from("quest_questions").delete().eq("quest_id", quest.id)
      const rows = questions.map((question, index) => ({
        quest_id: quest.id,
        type: question.type,
        prompt: question.prompt,
        options: question.type === "open_ended" ? [] : question.options,
        correct_answer:
          question.type === "open_ended" ? "__open_ended__" : question.correctAnswer,
        explanation: question.explanation ?? null,
        points: question.points,
        sort_order: index + 1,
      }))
      if (rows.length === 0) return NextResponse.json({ quest: data })

      const { error: questionError } = await supabase.from("quest_questions").insert(rows)
      if (questionError) throw questionError
    }

    return NextResponse.json({ quest: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update quest" },
      { status: 400 }
    )
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, quest } = await requireOwnedQuest(id)
    const { data: hydratedQuest } = await supabase
      .from("quests")
      .select(
        "*, link:links(id,type,title,description,thumbnail_url,price_usdc,suggested_amount_usdc,document_page_count,document_file_size_bytes,pack_file_count,pack_total_size_bytes,access_expiry_type)"
      )
      .eq("id", id)
      .single()
    const { data: questions } = await supabase
      .from("quest_questions")
      .select("*")
      .eq("quest_id", id)
      .order("sort_order", { ascending: true })

    return NextResponse.json({ quest: hydratedQuest ?? quest, questions: questions ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load quest" },
      { status: 400 }
    )
  }
}
