import { ONBOARDING_STEP_META } from "@/lib/onboarding/constants"
import { OnboardingStep } from "@/lib/onboarding/types"

export function OnboardingStepHeader({ step }: { step: OnboardingStep }) {
  const meta = ONBOARDING_STEP_META.find((item) => item.step === step)
  const stepNumber =
    ONBOARDING_STEP_META.findIndex((item) => item.step === step) + 1

  return (
    <header className="mb-8">
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        Step {stepNumber}/3
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
        {meta?.title}
      </h1>
      {meta?.step === "wallet" && (
        <p className="mt-3 max-w-xl text-muted-foreground">
          xpesa never holds your funds. Payments go directly to your wallet.
        </p>
      )}
    </header>
  )
}
