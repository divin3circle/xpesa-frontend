import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getReviewQuestions } from "@/lib/quests/ownership"
import { resolveAnalyticsOwner } from "@/lib/teams/access"
import { logTeamActivity } from "@/lib/teams/store"
import { answerForQuestion, reviewsByQuestion } from "@/lib/quests/review"
import type { QuestAnswer } from "@/lib/quests/types"

function csv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ownerParam = new URL(request.url).searchParams.get("ownerId")

    const auth = await createClient()
    const { data: userData } = await auth.auth.getUser()
    if (!userData.user) throw new Error("Not authenticated")

    const supabase = createAdminClient()
    // Self (owner) or an authorized team member; export requires can_export.
    const owner = await resolveAnalyticsOwner(supabase, userData.user.id, ownerParam)
    if (!owner.canExport) {
      return NextResponse.json({ error: "Export not permitted" }, { status: 403 })
    }

    const { data: quest } = await supabase
      .from("quests")
      .select("id, title, creator_id")
      .eq("id", id)
      .single()
    if (!quest || quest.creator_id !== owner.ownerId) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 })
    }

    const questions = await getReviewQuestions(supabase, id)
    const { data: attempts, error } = await supabase
      .from("quest_attempts")
      .select("*, participant:quest_participants(display_name,wallet_address)")
      .eq("quest_id", id)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })
    if (error) throw error

    const header = ["Name", "Wallet", "Score", "Max Score", "Submitted At"]
    questions.forEach((question) =>
      header.push(question.prompt, `${question.prompt} review`)
    )
    const rows = (attempts ?? []).map((attempt) => {
      const participant = Array.isArray(attempt.participant)
        ? attempt.participant[0]
        : attempt.participant
      const answers = attempt.answers as QuestAnswer[]
      const reviews = reviewsByQuestion(attempt.score_result)
      const row = [
        participant?.display_name,
        participant?.wallet_address,
        attempt.score,
        attempt.max_score,
        attempt.submitted_at,
      ]
      questions.forEach((question) => {
        row.push(
          answerForQuestion(answers, question.id),
          reviews.get(question.id)?.status ?? ""
        )
      })
      return row.map(csv).join(",")
    })

    // Record team-member exports on the owner's activity log.
    if (!owner.isSelf && owner.teamId) {
      await logTeamActivity(supabase, {
        teamId: owner.teamId,
        actorCreatorId: userData.user.id,
        action: "exported_csv",
        data: { quest_id: id, quest_title: quest.title },
      })
    }

    return new NextResponse([header.map(csv).join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${quest.title}-submissions.csv"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "CSV export failed" },
      { status: 400 }
    )
  }
}
