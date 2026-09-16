"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function TipFields({
  tipSuggestedAmountUsdc,
  setTipSuggestedAmountUsdc,
  tipMessage,
  setTipMessage,
}: {
  tipSuggestedAmountUsdc: string
  setTipSuggestedAmountUsdc: (value: string) => void
  tipMessage: string
  setTipMessage: (value: string) => void
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tip-amount">Suggested amount (USDC)</Label>
          <Input
            id="tip-amount"
            placeholder="Leave empty for pay-what-you-want"
            type="number"
            value={tipSuggestedAmountUsdc}
            onChange={(event) => setTipSuggestedAmountUsdc(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tip-thank-you">Thank-you message</Label>
          <Textarea
            id="tip-thank-you"
            maxLength={150}
            value={tipMessage}
            onChange={(event) => setTipMessage(event.target.value)}
          />
          <p className="text-right text-xs text-muted-foreground">
            {tipMessage.length}/150
          </p>
        </div>
      </div>
    </>
  )
}
