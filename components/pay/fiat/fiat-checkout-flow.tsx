import { KOTANI_COUNTRY_OPTIONS } from "@/lib/kotani-pay"
import type { FiatPaymentMethod } from "@/lib/payments/fiat"
import { DetailsStep } from "./details-step"
import { FiatStepper } from "./fiat-stepper"
import { FlowHeader } from "./flow-header"
import { getFiatStatusMessage } from "./messages"
import { QuoteStep } from "./quote-step"
import { ReviewStep } from "./review-step"
import type { useFiatCheckout } from "./use-fiat-checkout"

export function FiatCheckoutFlow({
  checkout,
  amount,
  method,
  onPay,
}: {
  checkout: ReturnType<typeof useFiatCheckout>
  amount: number
  method: FiatPaymentMethod
  onPay: () => void
}) {
  const { state, actions } = checkout
  const detailIsComplete =
    method === "mobile_money"
      ? Boolean(state.buyerPhone.trim())
      : Boolean(state.bankName.trim())
  const statusText = state.intent
    ? getFiatStatusMessage(state.intent.status, state.intent.failure_message)
    : "Ready to start"

  function changeCountry(value: string) {
    actions.setCountryCode(value)
    const country = KOTANI_COUNTRY_OPTIONS.find((option) => option.code === value)
    if (country) actions.setCurrencyCode(country.currency)
    actions.setQuote(null)
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 p-4">
      <FlowHeader method={method} />
      <FiatStepper
        step={state.step}
        onStepChange={actions.setStep}
        steps={[
          { key: "quote", label: "Quote", complete: Boolean(state.quote) },
          { key: "details", label: method === "mobile_money" ? "Phone" : "Bank", complete: detailIsComplete },
          { key: "review", label: "Pay", complete: state.intent?.status === "access_issued" },
        ]}
      />
      {state.step === "quote" ? (
        <QuoteStep
          countryCode={state.countryCode}
          currencyCode={state.currencyCode}
          isQuoting={state.isQuoting}
          amount={amount}
          onCountryChange={changeCountry}
          onCurrencyChange={(value) => {
            actions.setCurrencyCode(value)
            actions.setQuote(null)
          }}
          onContinue={() => void actions.createQuote()}
        />
      ) : state.step === "details" ? (
        <DetailsStep
          method={method}
          {...state}
          detailIsComplete={detailIsComplete}
          dialCode={state.selectedCountry?.dialCode}
          onPhoneChange={actions.setBuyerPhone}
          onBankNameChange={actions.setBankName}
          onBankRefChange={actions.setBankAccountRef}
          onNetworkChange={actions.setNetwork}
          onBack={() => actions.setStep("quote")}
          onContinue={() => actions.setStep("review")}
        />
      ) : (
        <ReviewStep
          quote={state.quote}
          amount={amount}
          method={method}
          network={state.network}
          bankName={state.bankName}
          statusText={statusText}
          isBusy={state.isCreating || state.isPolling}
          onBack={() => actions.setStep("details")}
          onPay={onPay}
        />
      )}
    </div>
  )
}
