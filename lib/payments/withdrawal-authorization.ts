import { envConfig } from "@/lib/env"
import { USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"
import {
  buildAuthorization,
  buildTransferWithAuthorizationTypedData,
  type TransferAuthorization,
} from "@/lib/payments/eip3009"

/**
 * Pure EIP-3009 authorization helpers for the creator offramp (no server-only imports, so
 * they're unit-testable). The auth/session resolver lives in `withdrawal-server.ts`.
 */

/** USDC 6-decimal base units as a decimal string (matches eip3009.buildAuthorization). */
export function usdcBaseUnits(valueUsdc: number): string {
  return BigInt(Math.round(valueUsdc * 1_000_000)).toString()
}

/** Build a fresh signable authorization + EIP-712 typed data for a withdrawal. */
export function buildWithdrawalTypedData(params: {
  from: string
  to: string
  valueUsdc: number
}) {
  const authorization = buildAuthorization({
    from: params.from,
    to: params.to,
    valueUsdc: params.valueUsdc,
  })
  const typedData = buildTransferWithAuthorizationTypedData({
    authorization,
    chainId: envConfig.PAYMENT_CHAIN_ID,
    usdcAddress: USDC_CONTRACT_ADDRESS,
    tokenName: envConfig.USDC_TOKEN_NAME,
    tokenVersion: envConfig.USDC_TOKEN_VERSION,
  })
  return { authorization, typedData }
}

/**
 * Validate a client-submitted authorization against the stored, trusted withdrawal fields.
 * Returns an error string, or null if valid. The signature separately proves wallet ownership
 * on-chain; this guards the amount/recipient/nonce so a client can't redirect or inflate funds.
 */
export function validateSignedAuthorization(
  authorization: TransferAuthorization,
  expected: { from: string; to: string; valueUsdc: number; nonce: string }
): string | null {
  const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
  if (!eq(authorization.from, expected.from)) return "Authorization sender mismatch"
  if (!eq(authorization.to, expected.to)) return "Authorization recipient mismatch"
  if (authorization.value !== usdcBaseUnits(expected.valueUsdc)) {
    return "Authorization amount mismatch"
  }
  if (!eq(authorization.nonce, expected.nonce)) return "Authorization nonce mismatch"
  if (Number(authorization.validBefore) <= Math.floor(Date.now() / 1000)) {
    return "Authorization has expired"
  }
  return null
}
