import { Contract, JsonRpcProvider, Wallet, parseUnits } from "ethers"
import type { ReceiptPaymentContext } from "./types"
import type { ReceiptNetworkConfig } from "./config"

const RECEIPT_ABI = [
  "function mintReceipt(address recipient,address creator,address paymentToken,uint256 amount,uint256 points,bytes32 paymentTxHash,bytes32 paymentId,uint64 paidAt,string uri) returns (uint256)",
  "function tokenIdForPayment(bytes32 paymentId) view returns (uint256)",
]

export async function mintReceiptOnchain({
  config,
  context,
  recipientWalletAddress,
  paymentId,
  points,
  tokenUri,
}: {
  config: ReceiptNetworkConfig
  context: ReceiptPaymentContext
  recipientWalletAddress: string
  paymentId: `0x${string}`
  points: number
  tokenUri: string
}) {
  const provider = new JsonRpcProvider(config.rpcUrl)
  const wallet = new Wallet(config.minterPrivateKey, provider)
  const contract = new Contract(config.contractAddress, RECEIPT_ABI, wallet)
  const amount = parseUnits(context.amountUsdc.toFixed(6), 6)
  const paidAt = Math.floor(new Date(context.createdAt).getTime() / 1000)

  const tx = await contract.mintReceipt(
    recipientWalletAddress,
    context.creatorWalletAddress,
    config.paymentToken,
    amount,
    points,
    context.paymentTxHash,
    paymentId,
    paidAt,
    tokenUri
  )
  const receipt = await tx.wait(1)
  const tokenId = await contract.tokenIdForPayment(paymentId)

  return {
    tokenId: tokenId.toString(),
    txHash: receipt?.hash || tx.hash,
  }
}
