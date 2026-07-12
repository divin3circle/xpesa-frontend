import { createAdminClient } from "@/lib/supabase/admin"
import { createPublicClient, http, parseAbi, decodeEventLog } from "viem"
import { avalanche, avalancheFuji, hedera, hederaTestnet } from "viem/chains"
import { NextRequest } from "next/server"
import {
  envConfig,
  getPaymentNetworkLabel,
  isAvalanchePaymentChain,
} from "@/lib/env"
import { USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"
import { createAccessForConfirmedPayment } from "@/lib/payments/access"

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
    recipient: envConfig.PLATFORM_WALLET_ADDRESS,
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
