import { Button } from "@/components/ui/button"
import type { KotaniNetwork } from "@/lib/kotani-pay"
import type { FiatPaymentMethod } from "@/lib/payments/fiat"
import type { FiatQuote } from "./types"

export function ReviewStep({
  quote,
  amount,
  method,
  network,
  bankName,
  statusText,
  isBusy,
  onBack,
  onPay,
}: {
  quote: FiatQuote | null
  amount: number
  method: FiatPaymentMethod
  network: KotaniNetwork
  bankName: string
  statusText: string
  isBusy: boolean
  onBack: () => void
  onPay: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-muted/40 p-3 text-sm">
        <SummaryRow
          label="You pay"
          value={
            quote
              ? `${quote.amountFiat.toLocaleString()} ${quote.fiatCurrency}`
              : `${amount.toFixed(2)} USDC equivalent`
          }
        />
        <SummaryRow
          label="Method"
          value={method === "mobile_money" ? network.toUpperCase() : bankName}
        />
        <SummaryRow label="Status" value={statusText} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isBusy}>
          Back
        </Button>
        <Button type="button" onClick={onPay} disabled={isBusy || amount <= 0}>
          {isBusy ? "Processing..." : "Pay locally"}
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex justify-between gap-3 first:mt-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
