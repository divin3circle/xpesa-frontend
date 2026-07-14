import { envConfig, getPaymentNetworkLabel } from "@/lib/env"

export type QuestBadgeMetadataInput = {
  questId: string
  questTitle: string
  questDescription: string | null
  participantName: string
  score: number
  maxScore: number
  imageUri: string
  completedAt: string
}

export function buildQuestBadgeMetadata(input: QuestBadgeMetadataInput) {
  return {
    name: `${input.questTitle} Completion Badge`,
    description:
      input.questDescription ||
      "Awarded for completing an XPesa creator quest.",
    image: input.imageUri,
    external_url: `${envConfig.APP_URL}/quest/${input.questId}/leaderboard`,
    attributes: [
      { trait_type: "Quest", value: input.questTitle },
      { trait_type: "Participant", value: input.participantName },
      { trait_type: "Score", value: input.score },
      { trait_type: "Max Score", value: input.maxScore },
      { trait_type: "Network", value: getPaymentNetworkLabel() },
      { trait_type: "Badge Type", value: "Quest Completion" },
      { trait_type: "Completed At", value: input.completedAt },
    ],
  }
}
