import type { createAdminClient } from "@/lib/supabase/admin"
import type { ReceiptPaymentContext, ReceiptRecord } from "./types"

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

function normalizeAddress(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

function asNumber(value: unknown) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export async function getReceiptContextByAccessToken(
  supabase: SupabaseAdminClient,
  accessTokenId: string
): Promise<ReceiptPaymentContext> {
  const { data: token, error: tokenError } = await supabase
    .from("access_tokens")
    .select("id, transaction_id")
    .eq("id", accessTokenId)
    .single()

  if (tokenError || !token?.transaction_id) {
    throw new Error("Access token is not eligible for receipt minting")
  }

  return getReceiptContextByTransactionId(supabase, token.transaction_id, token.id)
}

export async function getReceiptContextByTransactionId(
  supabase: SupabaseAdminClient,
  transactionId: string,
  accessTokenId = ""
): Promise<ReceiptPaymentContext> {
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(
      "id, payment_intent_id, link_id, creator_id, fan_wallet_address, tx_hash, amount_usdc, created_at, link:links(title, creator:creators(wallet_address, display_name))"
    )
    .eq("id", transactionId)
    .eq("status", "confirmed")
    .single()

  if (error || !transaction) throw new Error("Confirmed transaction not found")
  if (!transaction.tx_hash) throw new Error("Payment transaction hash is missing")

  const link = first(transaction.link)
  const creator = first(link?.creator)
  const creatorWallet = creator?.wallet_address

  if (!creatorWallet) throw new Error("Creator wallet is missing")

  return {
    accessTokenId,
    transactionId: transaction.id,
    paymentIntentId: transaction.payment_intent_id,
    linkId: transaction.link_id,
    creatorId: transaction.creator_id,
    payerWalletAddress: normalizeAddress(transaction.fan_wallet_address),
    creatorWalletAddress: creatorWallet,
    creatorName: creator?.display_name || link?.title || "Creator",
    paymentTxHash: transaction.tx_hash as `0x${string}`,
    amountUsdc: asNumber(transaction.amount_usdc),
    createdAt: transaction.created_at,
  }
}

export async function getReceiptByTransaction(
  supabase: SupabaseAdminClient,
  transactionId: string
): Promise<ReceiptRecord | null> {
  const { data } = await supabase
    .from("nft_receipts")
    .select("id, status, token_id, token_uri, image_uri, mint_tx_hash, failure_message")
    .eq("transaction_id", transactionId)
    .maybeSingle()

  return (data as ReceiptRecord | null) ?? null
}

export async function upsertReceiptDraft(
  supabase: SupabaseAdminClient,
  values: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("nft_receipts")
    .upsert(values, { onConflict: "transaction_id" })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message || "Failed to save receipt")
  return data
}

export async function updateReceiptStatus(
  supabase: SupabaseAdminClient,
  id: string,
  values: Record<string, unknown>
) {
  await supabase
    .from("nft_receipts")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
}
