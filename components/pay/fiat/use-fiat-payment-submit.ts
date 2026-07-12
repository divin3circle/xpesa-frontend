import { toast } from "sonner"

import type { PublicLinkDetails } from "@/app/api/public/links/route"
import type { FiatPaymentMethod } from "@/lib/payments/fiat"
import { createFiatIntent } from "./api"
import { getFiatErrorToast } from "./messages"
import type { useFiatCheckout } from "./use-fiat-checkout"

export function useFiatPaymentSubmit({
  link,
  amount,
  method,
  checkout,
}: {
  link: PublicLinkDetails
  amount: number
  method: FiatPaymentMethod
  checkout: ReturnType<typeof useFiatCheckout>
}) {
  const { state, actions } = checkout

  function validateDetails() {
    if (amount <= 0) return toast.error("Enter a valid payment amount"), false
    if (method === "mobile_money" && !state.buyerPhone.trim()) {
      return toast.error("Enter the buyer mobile money number"), false
    }
    if (method === "bank_transfer" && !state.bankName.trim()) {
      return toast.error("Enter the buyer bank name"), false
    }
    return true
  }

  return async function handlePay() {
    if (!validateDetails()) return
    actions.setIsCreating(true)
    try {
      const quote = state.quote ?? (await actions.createQuote())
      const intent = await createFiatIntent({
        linkId: link.id,
        amountUsdc: amount,
        method,
        quote,
        buyerPhone: state.buyerPhone,
        buyerCountry: state.countryCode,
        buyerNetwork: method === "mobile_money" ? state.network : undefined,
        bankName: method === "bank_transfer" ? state.bankName : undefined,
        bankAccountRef:
          method === "bank_transfer" ? state.bankAccountRef : undefined,
      })
      actions.setIntent(intent)
      toast.success("Payment started", {
        description: "Complete the payment prompt from Kotani.",
      })
      await actions.pollIntent(intent.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : null
      const errorToast = getFiatErrorToast(message)
      toast.error(errorToast.title, { description: errorToast.description })
    } finally {
      actions.setIsCreating(false)
    }
  }
}
