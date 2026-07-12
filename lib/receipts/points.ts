export function calculateReceiptPoints(amountUsdc: number) {
  if (!Number.isFinite(amountUsdc) || amountUsdc <= 0) return 0
  return Math.floor(amountUsdc * 100)
}
