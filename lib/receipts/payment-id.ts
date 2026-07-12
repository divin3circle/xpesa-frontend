import { solidityPackedKeccak256 } from "ethers"

export function deriveReceiptPaymentId({
  chainId,
  paymentTxHash,
  transactionId,
}: {
  chainId: number
  paymentTxHash: `0x${string}`
  transactionId: string
}) {
  return solidityPackedKeccak256(
    ["uint256", "bytes32", "string"],
    [chainId, paymentTxHash, transactionId]
  ) as `0x${string}`
}
