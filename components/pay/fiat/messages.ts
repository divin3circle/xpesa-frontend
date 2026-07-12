import { getFiatPaymentStatusMessage } from "@/lib/payments/fiat"
import type { FiatPaymentStatus } from "@/lib/payments/fiat"

const KOTANI_ONRAMP_UNAVAILABLE_DESCRIPTION =
  "The mobile money payment method is temporarily unavailable. Please use USDC for now."
const KOTANI_ONRAMP_UNAVAILABLE_TITLE =
  "Payment method temporarily unavailable"

function isKotaniOnrampUnavailable(message?: string | null) {
  const normalized = message?.toLowerCase() ?? ""
  return (
    normalized.includes("onramp") &&
    normalized.includes("not enabled")
  )
}

export function getFiatFailureMessage(message?: string | null) {
  if (isKotaniOnrampUnavailable(message)) {
    return KOTANI_ONRAMP_UNAVAILABLE_DESCRIPTION
  }
  return message || "Unknown error"
}

export function getFiatErrorToast(message?: string | null) {
  if (isKotaniOnrampUnavailable(message)) {
    return {
      title: KOTANI_ONRAMP_UNAVAILABLE_TITLE,
      description: KOTANI_ONRAMP_UNAVAILABLE_DESCRIPTION,
    }
  }

  return {
    title: "Local payment failed",
    description: message || "Unknown error",
  }
}

export function getFiatStatusDescription(message?: string | null) {
  if (!message) return undefined
  return getFiatFailureMessage(message)
}

export function getFiatStatusMessage(
  status: FiatPaymentStatus,
  failureMessage?: string | null
) {
  if (status === "failed" && isKotaniOnrampUnavailable(failureMessage)) {
    return KOTANI_ONRAMP_UNAVAILABLE_TITLE
  }

  return getFiatPaymentStatusMessage(status)
}
