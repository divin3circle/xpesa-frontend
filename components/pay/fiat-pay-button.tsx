"use client"

import { PublicLinkDetails } from "@/app/api/public/links/route"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { FiatPaymentMethod } from "@/lib/payments/fiat"
import { FiatCheckoutFlow } from "./fiat/fiat-checkout-flow"
import { useFiatCheckout } from "./fiat/use-fiat-checkout"
import { useFiatPaymentSubmit } from "./fiat/use-fiat-payment-submit"

export function FiatPayButton({
  link,
  amount,
  method,
}: {
  link: PublicLinkDetails
  amount: number
  method: FiatPaymentMethod
}) {
  const checkout = useFiatCheckout({ link, amount })
  const { state, actions } = checkout
  const handlePay = useFiatPaymentSubmit({ link, amount, method, checkout })
  const estimatedFiatAmount = state.quote?.amountFiat ?? amount * 130
  const estimatedFiatCurrency = state.quote?.fiatCurrency ?? state.currencyCode
  const payButtonLabel =
    state.isCreating || state.isPolling
      ? "Processing..."
      : `Pay ${estimatedFiatAmount.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })} ${estimatedFiatCurrency}`

  return (
    <>
      <Button
        type="button"
        className="h-12 w-full rounded-2xl"
        onClick={() => actions.setIsDialogOpen(true)}
        disabled={state.isCreating || state.isPolling || amount <= 0}
      >
        {payButtonLabel}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Powered by Kotani Pay. Access unlocks after USDC settlement.
      </p>
      <Dialog open={state.isDialogOpen} onOpenChange={actions.setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {method === "mobile_money" ? "Mobile money payment" : "Bank payment"}
            </DialogTitle>
            <DialogDescription>
              Complete one step at a time. Access unlocks after USDC settlement.
            </DialogDescription>
          </DialogHeader>
          <FiatCheckoutFlow
            checkout={checkout}
            amount={amount}
            method={method}
            onPay={handlePay}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
