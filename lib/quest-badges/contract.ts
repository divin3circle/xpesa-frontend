import { Contract, JsonRpcProvider, Wallet } from "ethers"
import type { QuestBadgeConfig } from "./config"

const QUEST_BADGE_ABI = [
  "function mintBadge(address recipient,bytes32 questId,bytes32 attemptId,bytes32 participantId,uint256 score,uint256 maxScore,bytes32 claimId,uint64 completedAt,string uri) returns (uint256)",
  "function tokenIdForClaim(bytes32 claimId) view returns (uint256)",
]

export async function mintQuestBadgeOnchain({
  config,
  recipient,
  questId,
  attemptId,
  participantId,
  score,
  maxScore,
  claimId,
  completedAt,
  tokenUri,
}: {
  config: QuestBadgeConfig
  recipient: string
  questId: `0x${string}`
  attemptId: `0x${string}`
  participantId: `0x${string}`
  score: number
  maxScore: number
  claimId: `0x${string}`
  completedAt: number
  tokenUri: string
}) {
  const provider = new JsonRpcProvider(config.rpcUrl)
  const wallet = new Wallet(config.minterPrivateKey, provider)
  const contract = new Contract(config.contractAddress, QUEST_BADGE_ABI, wallet)

  const tx = await contract.mintBadge(
    recipient,
    questId,
    attemptId,
    participantId,
    score,
    maxScore,
    claimId,
    completedAt,
    tokenUri
  )
  const receipt = await tx.wait(1)
  const tokenId = await contract.tokenIdForClaim(claimId)

  return {
    tokenId: tokenId.toString(),
    txHash: receipt?.hash || tx.hash,
  }
}
