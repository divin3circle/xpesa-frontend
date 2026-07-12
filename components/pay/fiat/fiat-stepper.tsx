import type { FiatCheckoutStep } from "./types"

export function FiatStepper({
  step,
  steps,
  onStepChange,
}: {
  step: FiatCheckoutStep
  steps: Array<{ key: FiatCheckoutStep; label: string; complete: boolean }>
  onStepChange: (step: FiatCheckoutStep) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((item, index) => {
        const active = step === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onStepChange(item.key)}
            className={`rounded-full border px-2 py-2 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : item.complete
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-border/70 text-muted-foreground"
            }`}
          >
            {index + 1}. {item.label}
          </button>
        )
      })}
    </div>
  )
}
