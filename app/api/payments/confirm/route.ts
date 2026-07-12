import { createAdminClient } from "@/lib/supabase/admin"
import {
  createPublicClient,
  http,
  parseAbi,
  decodeEventLog,
  parseUnits,
} from "viem"
import { avalanche, avalancheFuji, hedera, hederaTestnet } from "viem/chains"
import { NextRequest } from "next/server"
import {
  envConfig,
  getPaymentNetworkLabel,
  isAvalanchePaymentChain,
} from "@/lib/env"
import { USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"
import { createAccessForConfirmedPayment } from "@/lib/payments/access"
import { auditSecurityEvent } from "@/lib/security/audit"
import {
  checkSensitiveRateLimit,
  rateLimitResponse,
} from "@/lib/security/sensitive-rate-limit"

const isDevelopment = envConfig.IS_DEV
const isAvalanche = isAvalanchePaymentChain()

const network = isAvalanche
  ? isDevelopment
    ? avalancheFuji
    : avalanche
  : isDevelopment
    ? hederaTestnet
    : hedera

const networkLabel = getPaymentNetworkLabel()

const expectedChainId = envConfig.CHAIN_ID

const viemClient = createPublicClient({
  chain: network,
  transport: http(envConfig.RPC_URL),
})

const USDC_ADDRESS = USDC_CONTRACT_ADDRESS
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
  expectedValue,
}: {
  logs: ReceiptLog[]
  recipient: string
  expectedValue?: bigint
}) {
  return logs.some((log) => {
    try {
      const decoded = decodeEventLog({
        abi: USDC_ABI,
        data: log.data,
        topics: [...log.topics] as [] | [`0x${string}`, ...`0x${string}`[]],
      }) as {
        eventName: string
        args: { to?: string; value?: bigint }
      }
      return (
        decoded.eventName === "Transfer" &&
        normalizeAddress(log.address) === normalizeAddress(USDC_ADDRESS) &&
        normalizeAddress(decoded.args.to) === normalizeAddress(recipient) &&
        (typeof expectedValue === "bigint"
          ? decoded.args.value === expectedValue
          : true)
      )
    } catch {
      return false
    }
  })
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const { txHash, linkId, fanWalletAddress, amountPaid } = await request.json()
  const rateLimit = await checkSensitiveRateLimit({
    request,
    scope: "payment_confirm",
    identity: fanWalletAddress ?? linkId,
  })
  if (!rateLimit.allowed) {
    auditSecurityEvent("warn", "payment_confirm_rate_limited", { linkId })
    return rateLimitResponse(rateLimit.retryAfterSeconds)
  }

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
    auditSecurityEvent("warn", "payment_confirm_duplicate_tx", { linkId })
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

    return Response.json({
      accessToken: token.id,
      linkType: link.type,
      transactionId: existing.id,
      receiptEligible: isAvalanche,
    })
  }

  const { data: link } = await supabase
    .from("links")
    .select("*, creator:creators(wallet_address)")
    .eq("id", linkId)
    .eq("is_active", true)
    .eq("moderation_status", "approved")
    .single()

  if (!link) return Response.json({ error: "Link not found" }, { status: 404 })

  const expectedAmount = Number(link.suggested_amount_usdc ?? link.price_usdc ?? 0)
  const grossUsdc = Number(amountPaid)
  if (
    !Number.isFinite(grossUsdc) ||
    expectedAmount <= 0 ||
    Math.abs(expectedAmount - grossUsdc) > 0.000001
  ) {
    auditSecurityEvent("warn", "payment_confirm_wrong_amount", {
      linkId,
      expectedAmount,
      providedAmount: grossUsdc,
    })
    return Response.json(
      { error: "Payment amount does not match this link" },
      { status: 422 }
    )
  }

  if (!envConfig.PLATFORM_WALLET_ADDRESS) {
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

  const receipt = await viemClient.waitForTransactionReceipt({
    hash: txHash,
    timeout: 60_000,
  })
  if (receipt.status !== "success") {
    return Response.json({ error: "Transaction failed" }, { status: 400 })
  }

  const onchainTransaction = await viemClient.getTransaction({ hash: txHash })
  if (onchainTransaction.chainId !== expectedChainId) {
    auditSecurityEvent("warn", "payment_confirm_wrong_chain", {
      linkId,
      expectedChainId,
      actualChainId: onchainTransaction.chainId,
    })
    return Response.json(
      {
        error: `Wrong chain. Expected ${networkLabel} (${expectedChainId})`,
      },
      { status: 400 }
    )
  }

  const platformFee = grossUsdc * 0.05
  const creatorNet = grossUsdc - platformFee
  const creatorTransferFound = hasTransferTo({
    logs: receipt.logs,
    recipient: creatorWalletAddress,
    expectedValue: parseUnits(creatorNet.toFixed(6), 6),
  })

  const platformTransferFound = hasTransferTo({
    logs: receipt.logs,
    recipient: envConfig.PLATFORM_WALLET_ADDRESS,
    expectedValue: parseUnits(platformFee.toFixed(6), 6),
  })

  if (!creatorTransferFound || !platformTransferFound) {
    auditSecurityEvent("warn", "payment_confirm_required_transfer_missing", {
      linkId,
      creatorTransferFound,
      platformTransferFound,
    })
    return Response.json(
      { error: "Required transfers not found" },
      { status: 400 }
    )
  }

  const { accessToken, linkType, transactionId } =
    await createAccessForConfirmedPayment({
      supabase,
      link,
      fanWalletAddress,
      txHash,
      network: networkLabel,
      amountUsdc: grossUsdc,
      platformFeeUsdc: platformFee,
      creatorNetUsdc: creatorNet,
      requestHeaders: request.headers,
    })

  return Response.json({
    accessToken,
    linkType,
    transactionId,
    receiptEligible: isAvalanche,
  })
}
