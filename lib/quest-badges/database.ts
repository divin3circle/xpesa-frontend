import type { SupabaseClient } from "@supabase/supabase-js"

export async function getQuestNftCampaign(supabase: SupabaseClient, questId: string) {
  const { data, error } = await supabase
    .from("quest_nft_campaigns")
    .select("*")
    .eq("quest_id", questId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getQuestClaimContext(
  supabase: SupabaseClient,
  questId: string,
  attemptId: string
) {
  const { data, error } = await supabase
    .from("quest_attempts")
    .select(
      "*, participant:quest_participants(*), quest:quests(id,title,description,creator_id)"
    )
    .eq("id", attemptId)
    .eq("quest_id", questId)
    .single()

  if (error || !data) throw new Error("Quest attempt not found")
  return data
}

export async function getQuestNftClaim(
  supabase: SupabaseClient,
  questId: string,
  attemptId: string
) {
  const { data, error } = await supabase
    .from("quest_nft_claims")
    .select("*")
    .eq("quest_id", questId)
    .eq("attempt_id", attemptId)
    .maybeSingle()

  if (error) throw error
  return data
}
