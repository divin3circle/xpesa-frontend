import { randomBytes } from "crypto"

/**
 * EIP-3009 `transferWithAuthorization` support for non-custodial creator offramps.
 *
 * The creator (an external EOA) signs an off-chain EIP-712 authorization that moves a
 * bounded amount of USDC to a specific recipient (the Kotani offramp escrow address) within
 * a validity window. Our relayer broadcasts it and pays gas — the creator needs no AVAX and
 * the platform never custodies the funds. Circle-native USDC on Avalanche supports EIP-3009.
 */

export type TransferAuthorization = {
  from: string
  to: string
  /** USDC amount in 6-decimal base units, as a decimal string. */
  value: string
  validAfter: number
  validBefore: number
  /** 32-byte hex nonce (single-use). */
  nonce: string
}

const USDC_DECIMALS = 6

/**
 * Build a bounded transfer authorization: an exact `valueUsdc` to `to`, valid from now until
 * `now + ttlSeconds`, with a fresh random nonce.
 */
export function buildAuthorization(params: {
  from: string
  to: string
  valueUsdc: number
  ttlSeconds?: number
}): TransferAuthorization {
  const now = Math.floor(Date.now() / 1000)
  const value = BigInt(
    Math.round(params.valueUsdc * 10 ** USDC_DECIMALS)
  ).toString()
  return {
    from: params.from,
    to: params.to,
    value,
    validAfter: 0,
    validBefore: now + (params.ttlSeconds ?? 900),
    nonce: "0x" + randomBytes(32).toString("hex"),
  }
}

export type TransferWithAuthorizationTypedData = {
  domain: {
    name: string
    version: string
    chainId: number
    verifyingContract: string
  }
  types: {
    TransferWithAuthorization: { name: string; type: string }[]
  }
  primaryType: "TransferWithAuthorization"
  message: TransferAuthorization
}

/**
 * Produce the EIP-712 typed-data payload the creator's wallet signs. The domain must match the
 * deployed USDC contract's EIP-712 domain (name/version/chainId/verifyingContract) exactly, or
 * the on-chain `transferWithAuthorization` will revert.
 */
export function buildTransferWithAuthorizationTypedData(params: {
  authorization: TransferAuthorization
  chainId: number
  usdcAddress: string
  tokenName: string
  tokenVersion: string
}): TransferWithAuthorizationTypedData {
  return {
    domain: {
      name: params.tokenName,
      version: params.tokenVersion,
      chainId: params.chainId,
      verifyingContract: params.usdcAddress,
    },
    types: {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    },
    primaryType: "TransferWithAuthorization",
    message: { ...params.authorization },
  }
}
