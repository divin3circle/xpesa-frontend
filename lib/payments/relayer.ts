import { ethers } from "ethers"

import { envConfig } from "@/lib/env"
import { USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"
import type { TransferAuthorization } from "@/lib/payments/eip3009"

/**
 * Broadcasts a creator-signed EIP-3009 authorization. The relayer (the platform wallet) only
 * pays gas — the USDC moves from the creator's EOA to the recipient encoded in the signed
 * authorization. The platform never custodies the funds and cannot alter the amount/recipient.
 */

const EIP3009_ABI = [
  "function transferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce,bytes signature)",
] as const

export async function relayTransferWithAuthorization(params: {
  authorization: TransferAuthorization
  signature: string
}): Promise<{ txHash: string }> {
  if (!envConfig.PLATFORM_WALLET_PRIVATE_KEY) {
    throw new Error("Relayer signer is not configured")
  }
  const provider = new ethers.JsonRpcProvider(envConfig.RPC_URL)
  const wallet = new ethers.Wallet(envConfig.PLATFORM_WALLET_PRIVATE_KEY, provider)
  const usdc = new ethers.Contract(USDC_CONTRACT_ADDRESS, EIP3009_ABI, wallet)
  const a = params.authorization
  const tx = await usdc.transferWithAuthorization(
    a.from,
    a.to,
    a.value,
    a.validAfter,
    a.validBefore,
    a.nonce,
    params.signature
  )
  return { txHash: tx.hash }
}
