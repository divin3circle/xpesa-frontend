import { createAdminClient } from "@/lib/supabase/admin"
import type { User } from "@supabase/supabase-js"
import { analyzeModeration, failedAnalysis } from "./decision"
import { moderateWithOpenAI } from "./openai"
import { buildModerationText, localPolicyReason } from "./policy"
import { applyModerationAnalysis } from "./store"

export async function runLinkModeration(linkId: string, actor: User) {
  const supabase = createAdminClient()
  const { data: link, error } = await supabase
    .from("links")
    .select(
      "id, type, title, description, destination_url, moderation_status"
    )
    .eq("id", linkId)
    .single()

  if (error || !link) {
    throw new Error(error?.message || "Link not found")
  }

  const text = buildModerationText({
    type: link.type,
    title: link.title,
    description: link.description,
    destinationUrl: link.destination_url,
  })

  try {
    const openai = await moderateWithOpenAI(text)
    const analysis = analyzeModeration({
      openai,
      localReason: localPolicyReason(text),
    })
    await applyModerationAnalysis({
      supabase,
      link,
      analysis,
      actor,
    })
    return analysis
  } catch (error) {
    const analysis = failedAnalysis(error)
    await applyModerationAnalysis({
      supabase,
      link,
      analysis,
      actor,
    })
    return analysis
  }
}
