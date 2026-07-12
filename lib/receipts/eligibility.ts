import { isAddress } from "ethers"
import type { ReceiptPaymentContext } from "./types"

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function isMobileReceiptContext(context: ReceiptPaymentContext) {
  return context.payerWalletAddress.startsWith("kotani:")
}

export function assertReceiptRecipient({
  context,
  recipientWalletAddress,
}: {
  context: ReceiptPaymentContext
  recipientWalletAddress: string
}) {
  if (!isAddress(recipientWalletAddress)) {
    throw new Error("A valid wallet address is required")
  }

  if (isMobileReceiptContext(context)) return

  if (normalize(context.payerWalletAddress) !== normalize(recipientWalletAddress)) {
    throw new Error("Receipt must be minted to the paying wallet")
  }
}
