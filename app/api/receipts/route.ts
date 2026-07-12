import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getPaymentNetworkLabel } from "@/lib/env"
import { assertReceiptConfig, getReceiptConfig } from "@/lib/receipts/config"
import { mintReceiptOnchain } from "@/lib/receipts/contract"
import {
  getReceiptByTransaction,
  getReceiptContextByAccessToken,
  updateReceiptStatus,
  upsertReceiptDraft,
} from "@/lib/receipts/database"
import { assertReceiptRecipient } from "@/lib/receipts/eligibility"
import { buildReceiptMetadata } from "@/lib/receipts/metadata"
import { deriveReceiptPaymentId } from "@/lib/receipts/payment-id"
import { calculateReceiptPoints } from "@/lib/receipts/points"
import { uploadReceiptObject } from "@/lib/receipts/storage"
import { buildReceiptSvg } from "@/lib/receipts/svg"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

function receiptResponse(receipt: unknown) {
  return NextResponse.json({ receipt })
}

export async function GET(request: NextRequest) {
  const accessToken = request.nextUrl.searchParams.get("accessToken")?.trim()
  if (!accessToken) {
    return NextResponse.json({ error: "accessToken is required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const context = await getReceiptContextByAccessToken(supabase, accessToken)
  return receiptResponse(await getReceiptByTransaction(supabase, context.transactionId))
}

export async function POST(request: NextRequest) {
  const { accessToken, recipientWalletAddress } = await request.json()
  const rateLimit = await checkSensitiveRateLimit({
    request,
    scope: "receipt_mint",
    identity: recipientWalletAddress ?? accessToken,
  })
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

  if (!accessToken || !recipientWalletAddress) {
    return NextResponse.json(
      { error: "accessToken and recipientWalletAddress are required" },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const config = assertReceiptConfig(getReceiptConfig())
  const context = await getReceiptContextByAccessToken(supabase, accessToken)
  assertReceiptRecipient({ context, recipientWalletAddress })

  const existing = await getReceiptByTransaction(supabase, context.transactionId)
  if (existing?.status === "minted" || existing?.status === "minting") {
    return receiptResponse(existing)
  }

  const paymentId = deriveReceiptPaymentId({
    chainId: config.chainId,
    paymentTxHash: context.paymentTxHash,
    transactionId: context.transactionId,
  })
  const points = calculateReceiptPoints(context.amountUsdc)
  const keyId = paymentId.slice(2)
  const imageKey = `nft-receipts/images/${keyId}.svg`
  const metadataKey = `nft-receipts/metadata/${keyId}.json`

  const baseValues = {
    transaction_id: context.transactionId,
    payment_intent_id: context.paymentIntentId,
    link_id: context.linkId,
    creator_id: context.creatorId,
    payer_wallet_address: recipientWalletAddress,
    creator_wallet_address: context.creatorWalletAddress,
    chain_id: config.chainId,
    contract_address: config.contractAddress,
    payment_token: config.paymentToken,
    payment_tx_hash: context.paymentTxHash,
    payment_id: paymentId,
    points,
  }

  const draft = await upsertReceiptDraft(supabase, {
    ...baseValues,
    status: "eligible",
  })

  try {
    const imageInput = {
      ...context,
      paymentId,
      points,
      networkName: getPaymentNetworkLabel(),
      imageUri: "",
    }
    const image = await uploadReceiptObject({
      key: imageKey,
      body: buildReceiptSvg(imageInput),
      contentType: "image/svg+xml",
    })
    const metadata = buildReceiptMetadata({ ...imageInput, imageUri: image.uri })
    const token = await uploadReceiptObject({
      key: metadataKey,
      body: JSON.stringify(metadata),
      contentType: "application/json",
    })

    await updateReceiptStatus(supabase, draft.id, {
      status: "minting",
      image_uri: image.uri,
      token_uri: token.uri,
      image_r2_key: image.key,
      metadata_r2_key: token.key,
    })

    const minted = await mintReceiptOnchain({
      config,
      context,
      recipientWalletAddress,
      paymentId,
      points,
      tokenUri: token.uri,
    })

    await updateReceiptStatus(supabase, draft.id, {
      status: "minted",
      token_id: minted.tokenId,
      mint_tx_hash: minted.txHash,
      minted_at: new Date().toISOString(),
    })

    return receiptResponse({
      ...draft,
      ...baseValues,
      status: "minted",
      token_id: minted.tokenId,
      token_uri: token.uri,
      image_uri: image.uri,
      mint_tx_hash: minted.txHash,
    })
  } catch (error) {
    console.error("[receipts/mint] failed", error)
    await updateReceiptStatus(supabase, draft.id, {
      status: "failed",
      failure_message: error instanceof Error ? error.message : "Mint failed",
    })
    return NextResponse.json(
      { error: "Receipt mint failed. Please try again." },
      { status: 500 }
    )
  }
}
