/**
 * Platform fee taken on the gross amount of every sale.
 * The creator receives (1 - XPESA_PLATFORM_FEE_RATE) of each payment.
 *
 * Single source of truth: import this everywhere instead of hardcoding 0.12.
 * Used by the direct USDC pay path, the multichain settlement path, the fiat
 * (Kotani) path, and the server-side payment confirmation.
 */
export const XPESA_PLATFORM_FEE_RATE = 0.12
