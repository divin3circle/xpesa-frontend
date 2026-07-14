import { NextRequest, NextResponse } from "next/server"
import { isAddress } from "ethers"
import { z } from "zod"

import {
  assertQuestBadgeConfig,
  getQuestBadgeConfig,
} from "@/lib/quest-badges/config"
import { updateQuestNftClaim, upsertQuestNftClaim } from "@/lib/quest-badges/claims"
import { mintQuestBadgeOnchain } from "@/lib/quest-badges/contract"
import {
  getQuestClaimContext,
  getQuestNftCampaign,
  getQuestNftClaim,
} from "@/lib/quest-badges/database"
import { deriveQuestClaimId, uuidToBytes32 } from "@/lib/quest-badges/ids"
import { buildQuestBadgeMetadata } from "@/lib/quest-badges/metadata"
import { uploadQuestBadgeObject } from "@/lib/quest-badges/storage"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

const claimSchema = z.object({
  attemptId: z.string().uuid(),
  recipientWalletAddress: z.string().trim().min(8).max(80),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const attemptId = request.nextUrl.searchParams.get("attemptId")
    if (!attemptId) throw new Error("attemptId is required")

    const supabase = createAdminClient()
    const campaign = await getQuestNftCampaign(supabase, id)
    const claim = await getQuestNftClaim(supabase, id, attemptId)
    return NextResponse.json({ campaign, claim })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load NFT claim" },
      { status: 400 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const input = claimSchema.parse(await request.json())
    const rateLimit = await checkSensitiveRateLimit({
      request,
      scope: "quest_nft_claim",
      identity: `${id}:${input.attemptId}`,
      limit: 6,
      windowSeconds: 60,
    })
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

    const supabase = createAdminClient()
    const config = assertQuestBadgeConfig(getQuestBadgeConfig())
    const campaign = await getQuestNftCampaign(supabase, id)
    if (!campaign?.enabled || campaign.status !== "ready") {
      return NextResponse.json({ error: "This quest has no NFT reward" }, { status: 400 })
    }
    if (!campaign.image_url) {
      return NextResponse.json({ error: "Quest NFT artwork is missing" }, { status: 400 })
    }

    const context = await getQuestClaimContext(supabase, id, input.attemptId)
    if (context.status !== "submitted") {
      return NextResponse.json({ error: "Submit your quest result first" }, { status: 400 })
    }

    const participant = context.participant
    const wallet = input.recipientWalletAddress
    if (!isAddress(wallet)) {
      return NextResponse.json(
        { error: "Connect an EVM wallet before claiming this NFT" },
        { status: 400 }
      )
    }
    if (participant?.wallet_address && isAddress(participant.wallet_address)) {
      if (participant.wallet_address.toLowerCase() !== wallet.toLowerCase()) {
        return NextResponse.json(
          { error: "Use the wallet registered for this quest attempt" },
          { status: 400 }
        )
      }
    } else {
      await supabase
        .from("quest_participants")
        .update({
          wallet_address: wallet,
          wallet_address_normalized: wallet.toLowerCase(),
        })
        .eq("id", participant.id)
    }

    const claimId = deriveQuestClaimId({
      chainId: config.chainId,
      questId: id,
      participantId: participant.id,
    })
    const existing = await getQuestNftClaim(supabase, id, input.attemptId)
    if (existing?.status === "minted" || existing?.status === "minting") {
      return NextResponse.json({ claim: existing })
    }

    const claim = await upsertQuestNftClaim(supabase, {
      context,
      campaign,
      config,
      claimId,
      wallet,
    })

    try {
      const keyId = claimId.slice(2)
      const token = await uploadQuestBadgeObject({
        key: `quest-badges/metadata/${keyId}.json`,
        body: JSON.stringify(buildQuestBadgeMetadata({
          questId: id,
          questTitle: context.quest.title,
          questDescription: context.quest.description,
          participantName: participant.display_name,
          score: Number(context.score ?? 0),
          maxScore: Number(context.max_score ?? 0),
          imageUri: campaign.image_url,
          completedAt: context.submitted_at,
        })),
        contentType: "application/json",
      })

      await updateQuestNftClaim(supabase, claim.id, {
        status: "minting",
        token_uri: token.uri,
      })
      const minted = await mintQuestBadgeOnchain({
        config,
        recipient: wallet,
        questId: uuidToBytes32(id),
        attemptId: uuidToBytes32(input.attemptId),
        participantId: uuidToBytes32(participant.id),
        score: Number(context.score ?? 0),
        maxScore: Number(context.max_score ?? 0),
        claimId,
        completedAt: Math.floor(new Date(context.submitted_at).getTime() / 1000),
        tokenUri: token.uri,
      })

      const finalClaim = await updateQuestNftClaim(supabase, claim.id, {
        status: "minted",
        token_id: minted.tokenId,
        token_uri: token.uri,
        mint_tx_hash: minted.txHash,
        claimed_at: new Date().toISOString(),
      })
      return NextResponse.json({ claim: finalClaim })
    } catch (error) {
      await updateQuestNftClaim(supabase, claim.id, {
        status: "failed",
        failure_message: error instanceof Error ? error.message : "Mint failed",
      })
      return NextResponse.json(
        { error: "Quest NFT claim failed. Please retry." },
        { status: 500 }
      )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Quest NFT claim failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
