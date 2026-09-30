import { defineChain, prepareContractCall } from "thirdweb"
import { ENTRYPOINT_ADDRESS_v0_6 } from "thirdweb/wallets/smart"
import { hexToBigInt, isHex, toHex } from "viem"
import { envConfig, isAvalanchePaymentChain } from "../env"

const hederaMainnet = defineChain(295)
const hederaTestnet = defineChain(296)
const avalancheMainnet = defineChain(43114)
const avalancheFuji = defineChain(43113)

function resolveDefaultChain() {
  if (isAvalanchePaymentChain()) {
    return envConfig.IS_DEV ? avalancheFuji : avalancheMainnet
  }

  return envConfig.IS_DEV ? hederaTestnet : hederaMainnet
}

export const defaultChain = resolveDefaultChain()

// --- Optional Pimlico gas sponsorship -----------------------------------------
// By default gas is sponsored through thirdweb's own paymaster (sponsorGas: true),
// which requires a paid thirdweb plan. When NEXT_PUBLIC_PIMLICO_ENABLED === "true",
// we instead sponsor via Pimlico (pay-as-you-go, no thirdweb plan needed).
//
// The Pimlico key is NEVER exposed to the client: bundler + paymaster calls are
// routed through our own backend proxy (app/api/pimlico/[chainId]/route.ts), which
// attaches PIMLICO_API_KEY server-side. Only the on/off flag is public.
//
// GATED OFF BY DEFAULT: leave NEXT_PUBLIC_PIMLICO_ENABLED unset until this has been
// verified with a real payment on Fuji. Assumes EntryPoint v0.6 (thirdweb default).
const PIMLICO_ENABLED = process.env.NEXT_PUBLIC_PIMLICO_ENABLED === "true"

// Absolute URL to our proxy. Built from the browser origin (this config is only
// used client-side); during SSR window is undefined and the relative path is fine.
function pimlicoProxyUrl(chainId: number) {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  return `${origin}/api/pimlico/${chainId}`
}

// Mirrors thirdweb's getPaymasterAndData request/response, but sponsors via our
// Pimlico proxy instead of thirdweb's default (paid) paymaster.
function createPimlicoPaymaster(chainId: number) {
  const url = pimlicoProxyUrl(chainId)
  return async (userOp: Record<string, unknown>) => {
    const hexlified = Object.fromEntries(
      Object.entries(userOp).map(([key, val]) => [
        key,
        val === undefined || val === null || isHex(val as string)
          ? val
          : toHex(val as bigint),
      ])
    )
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "pm_sponsorUserOperation",
        params: [hexlified, ENTRYPOINT_ADDRESS_v0_6],
      }),
    })
    if (!response.ok) {
      throw new Error(
        `Pimlico paymaster error: ${response.status} - ${await response.text()}`
      )
    }
    const res = await response.json()
    if (!res.result) {
      throw new Error(
        `Pimlico paymaster error: ${res.error?.message ?? "unknown error"}`
      )
    }
    if (typeof res.result === "string") {
      return { paymasterAndData: res.result }
    }
    const r = res.result
    return {
      paymasterAndData: r.paymasterAndData,
      paymaster: r.paymaster,
      paymasterData: r.paymasterData,
      callGasLimit: r.callGasLimit ? hexToBigInt(r.callGasLimit) : undefined,
      verificationGasLimit: r.verificationGasLimit
        ? hexToBigInt(r.verificationGasLimit)
        : undefined,
      preVerificationGas: r.preVerificationGas
        ? hexToBigInt(r.preVerificationGas)
        : undefined,
      paymasterVerificationGasLimit: r.paymasterVerificationGasLimit
        ? hexToBigInt(r.paymasterVerificationGasLimit)
        : undefined,
      paymasterPostOpGasLimit: r.paymasterPostOpGasLimit
        ? hexToBigInt(r.paymasterPostOpGasLimit)
        : undefined,
    }
  }
}

// --- Pimlico gas price -------------------------------------------------------
// thirdweb only asks the bundler for userOp gas fees when the bundler URL is a
// thirdweb URL (isThirdwebUrl). Behind our Pimlico proxy it instead falls back to
// plain RPC gas estimation, which on Avalanche returns a priority fee far below
// what Pimlico's bundler requires — hence "maxPriorityFeePerGas must be at least
// ... (current: 160)". So we fetch Pimlico's own recommended price and set it
// explicitly on the userOp's execute/executeBatch call (the only place thirdweb
// reads explicit fees for a non-thirdweb bundler).
async function fetchPimlicoUserOpGasPrice(chainId: number) {
  try {
    const res = await fetch(pimlicoProxyUrl(chainId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "pimlico_getUserOperationGasPrice",
        params: [],
      }),
    })
    const json = await res.json()
    const tier =
      json?.result?.fast ?? json?.result?.standard ?? json?.result?.slow
    if (!tier?.maxFeePerGas || !tier?.maxPriorityFeePerGas) return null
    return {
      maxFeePerGas: BigInt(tier.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(tier.maxPriorityFeePerGas),
    }
  } catch {
    return null
  }
}

// Briefly cache the in-flight fetch so the two fee thunks on one userOp
// (maxFeePerGas + maxPriorityFeePerGas) don't each hit the proxy.
let gasFeeCache: {
  at: number
  promise: ReturnType<typeof fetchPimlicoUserOpGasPrice>
} | null = null
function cachedPimlicoGasFees(chainId: number) {
  const now = Date.now()
  if (gasFeeCache && now - gasFeeCache.at < 10_000) return gasFeeCache.promise
  const promise = fetchPimlicoUserOpGasPrice(chainId)
  gasFeeCache = { at: now, promise }
  return promise
}

// Replicate thirdweb's default execute / executeBatch builders (calls.js) but
// attach Pimlico's gas price. Returning undefined fees (fetch failed) degrades
// gracefully to thirdweb's RPC estimation.
/* eslint-disable @typescript-eslint/no-explicit-any */
function pimlicoExecuteOverride(chainId: number) {
  return (accountContract: any, transaction: any) => {
    let value = transaction.value || BigInt(0)
    if (transaction.chainId === 295 || transaction.chainId === 296) {
      value = BigInt(value) / BigInt(10 ** 10)
    }
    return prepareContractCall({
      contract: accountContract,
      gas: transaction.gas ? transaction.gas + BigInt(21000) : undefined,
      method: "function execute(address, uint256, bytes)",
      params: [transaction.to || "", value, transaction.data || "0x"],
      maxFeePerGas: async () => (await cachedPimlicoGasFees(chainId))?.maxFeePerGas,
      maxPriorityFeePerGas: async () =>
        (await cachedPimlicoGasFees(chainId))?.maxPriorityFeePerGas,
    })
  }
}
function pimlicoExecuteBatchOverride(chainId: number) {
  return (accountContract: any, transactions: any[]) => {
    let values = transactions.map((tx) => tx.value || BigInt(0))
    const cid = transactions[0]?.chainId
    if (cid === 295 || cid === 296) {
      values = values.map((v) => BigInt(v) / BigInt(10 ** 10))
    }
    return prepareContractCall({
      contract: accountContract,
      method: "function executeBatch(address[], uint256[], bytes[])",
      params: [
        transactions.map((tx) => tx.to || ""),
        values,
        transactions.map((tx) => tx.data || "0x"),
      ],
      maxFeePerGas: async () => (await cachedPimlicoGasFees(chainId))?.maxFeePerGas,
      maxPriorityFeePerGas: async () =>
        (await cachedPimlicoGasFees(chainId))?.maxPriorityFeePerGas,
    })
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const smartAccountConfig = {
  chain: defaultChain,
  sponsorGas: true,
  ...(PIMLICO_ENABLED
    ? {
        overrides: {
          bundlerUrl: pimlicoProxyUrl(defaultChain.id),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paymaster: createPimlicoPaymaster(defaultChain.id) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          execute: pimlicoExecuteOverride(defaultChain.id) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          executeBatch: pimlicoExecuteBatchOverride(defaultChain.id) as any,
        },
      }
    : {}),
}
