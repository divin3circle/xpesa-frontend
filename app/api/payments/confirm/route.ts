import { createAdminClient } from "@/lib/supabase/admin"
import { createPublicClient, http, parseAbi, decodeEventLog } from "viem"
import { hederaTestnet, hedera } from "viem/chains"
import { NextRequest } from "next/server"
import { Redis } from "@upstash/redis"
import { randomUUID } from "crypto"
import { envConfig } from "@/lib/utils"
import crypto from "crypto"
import { USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"

const redis = Redis.fromEnv()
const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS

const network = envConfig.ENV === "DEV" ? hederaTestnet : hedera
const networkLabel =
  envConfig.ENV === "DEV" ? "hedera-testnet" : "hedera-mainnet"
const expectedChainId = network.id

const viemClient = createPublicClient({
  chain: network,
  transport: http(envConfig.RPC_URL),
})

const USDC_ADDRESS =
  USDC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000068cda"
const USDC_ABI = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
])

function normalizeAddress(address: string | null | undefined) {
  return address?.toLowerCase() ?? ""
}

type ReceiptLog = {
  address: string
  topics: readonly string[]
  data: `0x${string}`
}

function hasTransferTo({
  logs,
  recipient,
}: {
  logs: ReceiptLog[]
  recipient: string
}) {
  return logs.some((log) => {
    try {
      const decoded = decodeEventLog({
        abi: USDC_ABI,
        data: log.data,
        topics: [...log.topics] as [] | [`0x${string}`, ...`0x${string}`[]],
      }) as {
        eventName: string
        args: { to?: string }
      }
      return (
        decoded.eventName === "Transfer" &&
        normalizeAddress(log.address) === normalizeAddress(USDC_ADDRESS) &&
        normalizeAddress(decoded.args.to) === normalizeAddress(recipient)
      )
    } catch {
      return false
    }
  })
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const { txHash, linkId, fanWalletAddress, amountPaid } = await request.json()
  if (!txHash || !linkId || !fanWalletAddress || !amountPaid) {
    return Response.json(
      {
        error: "txHash, linkId, fanWalletAddress, and amountPaid are required",
      },
      { status: 400 }
    )
  }

  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("tx_hash", txHash)
    .single()

  if (existing) {
    const { data: token } = await supabase
      .from("access_tokens")
      .select("id")
      .eq("transaction_id", existing.id)
      .single()
    const { data: link } = await supabase
      .from("links")
      .select("type")
      .eq("id", linkId)
      .single()

    if (!token || !link) {
      return Response.json(
        { error: "Access token or link not found" },
        { status: 404 }
      )
    }

    return Response.json({ accessToken: token.id, linkType: link.type })
  }

  const { data: link } = await supabase
    .from("links")
    .select("*, creator:creators(wallet_address)")
    .eq("id", linkId)
    .eq("is_active", true)
    .single()

  if (!link) return Response.json({ error: "Link not found" }, { status: 404 })

  if (!PLATFORM_WALLET_ADDRESS) {
    return Response.json(
      { error: "Platform wallet not configured" },
      { status: 500 }
    )
  }

  const creatorWalletAddress = link.creator?.wallet_address
  if (!creatorWalletAddress) {
    return Response.json(
      { error: "Creator wallet not configured" },
      { status: 500 }
    )
  }

  const receipt = await viemClient.getTransactionReceipt({ hash: txHash })
  if (receipt.status !== "success") {
    return Response.json({ error: "Transaction failed" }, { status: 400 })
  }

  const onchainTransaction = await viemClient.getTransaction({ hash: txHash })
  if (onchainTransaction.chainId !== expectedChainId) {
    return Response.json(
      {
        error: `Wrong chain. Expected ${networkLabel} (${expectedChainId})`,
      },
      { status: 400 }
    )
  }

  const creatorTransferFound = hasTransferTo({
    logs: receipt.logs,
    recipient: creatorWalletAddress,
  })

  const platformTransferFound = hasTransferTo({
    logs: receipt.logs,
    recipient: PLATFORM_WALLET_ADDRESS,
  })

  if (!creatorTransferFound || !platformTransferFound) {
    return Response.json(
      { error: "Required transfers not found" },
      { status: 400 }
    )
  }

  const grossUsdc = amountPaid
  const platformFee = grossUsdc * 0.05
  const creatorNet = grossUsdc - platformFee

  const { data: insertedTransaction } = await supabase
    .from("transactions")
    .insert({
      link_id: linkId,
      creator_id: link.creator_id,
      fan_wallet_address: fanWalletAddress,
      tx_hash: txHash,
      network: networkLabel,
      amount_usdc: grossUsdc,
      platform_fee_usdc: platformFee,
      creator_net_usdc: creatorNet,
      status: "confirmed",
      fan_ip_hash: hashIp(request.headers.get("x-forwarded-for") ?? ""),
    })
    .select()
    .single()

  await supabase.rpc("increment_link_stats", {
    p_link_id: linkId,
    p_amount: grossUsdc,
  })

  const tokenId = randomUUID()
  const expiresAt = calculateExpiry(link.access_expiry_type)
  const ipHash = link.access_ip_binding
    ? hashIp(request.headers.get("x-forwarded-for") ?? "")
    : null

  await supabase.from("access_tokens").insert({
    id: tokenId,
    transaction_id: insertedTransaction.id,
    link_id: linkId,
    fan_wallet_address: fanWalletAddress,
    expires_at: expiresAt,
    is_one_time: link.access_expiry_type === "one_time",
    bound_ip_hash: ipHash,
    max_views: link.access_max_views,
  })

  const ttl = expiresAt
    ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    : null

  if (ttl && ttl > 0) {
    await redis.set(`access:${tokenId}`, linkId, { ex: ttl })
  } else if (!expiresAt) {
    await redis.set(`access:${tokenId}`, linkId) // no expiry
  }

  return Response.json({
    accessToken: tokenId,
    linkType: link.type,
  })
}

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex")
}

function calculateExpiry(expiryType: string): string | null {
  const now = new Date()
  const map: Record<string, number> = {
    "5m": 5 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  }
  if (expiryType === "forever" || expiryType === "one_time") return null
  const ms = map[expiryType]
  if (!ms) return null
  return new Date(now.getTime() + ms).toISOString()
}
