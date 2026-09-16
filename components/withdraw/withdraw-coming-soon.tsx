import { Sparkles } from "lucide-react"

/**
 * Shown in place of the withdraw wizard while the Kotani off-ramp corridor is pending
 * (gated by envConfig.KOTANI_ENABLED). Creators keep full custody of their USDC meanwhile.
 */
export function WithdrawComingSoon() {
  return (
    <div className="my-6 flex w-full flex-col items-center gap-3 px-4 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-chart-1/10 text-chart-1">
        <Sparkles className="size-6" />
      </div>
      <h2 className="text-heading text-lg font-semibold">
        Withdraw to M-Pesa is coming soon
      </h2>
      <p className="max-w-sm text-sm text-foreground/70">
        We are finalizing our local off-ramp. Your earnings stay safely in your
        wallet as USDC, fully under your control. You can hold them, or move them
        to an external off-ramp to cash out to mobile money in the meantime.
      </p>
    </div>
  )
}
