import { solidityPackedKeccak256 } from "ethers"

export function uuidToBytes32(value: string) {
  return solidityPackedKeccak256(["string"], [value]) as `0x${string}`
}

export function deriveQuestClaimId({
  chainId,
  questId,
  participantId,
}: {
  chainId: number
  questId: string
  participantId: string
}) {
  return solidityPackedKeccak256(
    ["uint256", "string", "string"],
    [chainId, questId, participantId]
  ) as `0x${string}`
}
