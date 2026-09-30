import { defineChain } from "thirdweb"
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
// which requires a paid thirdweb plan. When NEXT_PUBLIC_PIMLICO_ENABLED === "true"
// and a key is present, we instead sponsor via Pimlico's pm_sponsorUserOperation
// (pay-as-you-go). The key is NEXT_PUBLIC (thirdweb runs AA in the browser), so it
// is exposed client-side — protect it with a Pimlico sponsorship policy.
//
// GATED OFF BY DEFAULT: leave NEXT_PUBLIC_PIMLICO_ENABLED unset until this has been
// verified with a real payment on Fuji. Assumes EntryPoint v0.6 (thirdweb default).
const PIMLICO_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
const PIMLICO_ENABLED = process.env.NEXT_PUBLIC_PIMLICO_ENABLED === "true"

const pimlicoRpcUrl = (chainId: number) =>
  `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${PIMLICO_KEY}`

// Mirrors thirdweb's getPaymasterAndData request/response, but targets Pimlico.
function createPimlicoPaymaster(chainId: number) {
  const url = pimlicoRpcUrl(chainId)
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

const usePimlico = PIMLICO_ENABLED && Boolean(PIMLICO_KEY)

export const smartAccountConfig = {
  chain: defaultChain,
  sponsorGas: true,
  ...(usePimlico
    ? {
        overrides: {
          bundlerUrl: pimlicoRpcUrl(defaultChain.id),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paymaster: createPimlicoPaymaster(defaultChain.id) as any,
        },
      }
    : {}),
}
