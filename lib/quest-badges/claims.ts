import type { SupabaseClient } from "@supabase/supabase-js"

import type { QuestBadgeConfig } from "./config"

type ClaimContext = {
  id: string
  quest_id: string
  participant_id: string
}

type ClaimCampaign = {
  image_url: string
}

export async function upsertQuestNftClaim(
  supabase: SupabaseClient,
  input: {
    context: ClaimContext
    campaign: ClaimCampaign
    config: QuestBadgeConfig
    claimId: string
    wallet: string
  }
) {
  const { context, campaign, config, claimId, wallet } = input
  const { data, error } = await supabase
    .from("quest_nft_claims")
    .upsert(
      {
        quest_id: context.quest_id,
        attempt_id: context.id,
        participant_id: context.participant_id,
        recipient_wallet_address: wallet,
        claim_id: claimId,
        status: "eligible",
        contract_address: config.contractAddress,
        chain_id: config.chainId,
        image_uri: campaign.image_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "claim_id" }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateQuestNftClaim(
  supabase: SupabaseClient,
  id: string,
  patch: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("quest_nft_claims")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}
