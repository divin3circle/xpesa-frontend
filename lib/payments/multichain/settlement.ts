import { ethers } from "ethers"

import { envConfig } from "@/lib/env"
import { USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"
import { createAccessForConfirmedPayment } from "@/lib/payments/access"
import { getCreatorWallet, type MultichainLink } from "./link"

type SupabaseAdminClient = ReturnType<
  typeof import("@/lib/supabase/admin").createAdminClient
>

const ERC20_ABI = ["function transfer(address to, uint256 amount) returns (bool)"]

function roundUsdc(value: number) {
  return Number(value.toFixed(6))
}

export async function settleMultichainPayment({
  supabase,
  intent,
  link,
  requestHeaders,
}: {
  supabase: SupabaseAdminClient
  intent: Record<string, any>
  link: MultichainLink
  requestHeaders: Headers
}) {
  if (intent.status === "access_issued") {
    return {
      accessToken: intent.access_token_id as string,
      transactionId: intent.transaction_id as string,
      linkType: link.type,
    }
  }

  if (!envConfig.PLATFORM_WALLET_PRIVATE_KEY) {
    throw new Error("Platform wallet signer is not configured")
  }

  const amountUsdc = Number(intent.amount_usdc)
  const platformFeeUsdc = roundUsdc(amountUsdc * 0.05)
  const creatorNetUsdc = roundUsdc(amountUsdc - platformFeeUsdc)
  const creatorWallet = getCreatorWallet(link)
  if (!creatorWallet) throw new Error("Creator wallet is not configured")

  let payoutTxHash = intent.payout_tx_hash as string | null
  if (!payoutTxHash) {
    await supabase
      .from("bridge_payment_intents")
      .update({ status: "settling", updated_at: new Date().toISOString() })
      .eq("id", intent.id)

    const provider = new ethers.JsonRpcProvider(envConfig.RPC_URL)
    const wallet = new ethers.Wallet(
      envConfig.PLATFORM_WALLET_PRIVATE_KEY,
      provider
    )
    const usdc = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, wallet)
    const tx = await usdc.transfer(
      creatorWallet,
      ethers.parseUnits(creatorNetUsdc.toFixed(6), 6)
    )
    payoutTxHash = tx.hash

    await supabase
      .from("bridge_payment_intents")
      .update({
        payout_tx_hash: payoutTxHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", intent.id)

    await tx.wait(1)
  }

  const access = await createAccessForConfirmedPayment({
    supabase,
    link,
    fanWalletAddress: String(intent.payer_wallet_address),
    txHash: String(intent.destination_tx_hash ?? payoutTxHash),
    network: "Multichain to Avalanche",
    amountUsdc,
    platformFeeUsdc,
    creatorNetUsdc,
    requestHeaders,
    paymentMethod: "multichain",
  })

  await supabase
    .from("bridge_payment_intents")
    .update({
      status: "access_issued",
      access_token_id: access.accessToken,
      transaction_id: access.transactionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", intent.id)

  return access
}
