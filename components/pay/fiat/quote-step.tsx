import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KOTANI_COUNTRY_OPTIONS, KOTANI_CURRENCY_OPTIONS } from "@/lib/kotani-pay"

export function QuoteStep({
  countryCode,
  currencyCode,
  isQuoting,
  amount,
  onCountryChange,
  onCurrencyChange,
  onContinue,
}: {
  countryCode: string
  currencyCode: string
  isQuoting: boolean
  amount: number
  onCountryChange: (value: string) => void
  onCurrencyChange: (value: string) => void
  onContinue: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={countryCode} onValueChange={onCountryChange}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KOTANI_COUNTRY_OPTIONS.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={currencyCode} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KOTANI_CURRENCY_OPTIONS.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        type="button"
        onClick={onContinue}
        disabled={isQuoting || amount <= 0}
        className="w-full"
      >
        {isQuoting ? "Getting quote..." : "Continue"}
      </Button>
    </div>
  )
}
