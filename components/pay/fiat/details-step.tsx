import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KOTANI_NETWORKS, type KotaniNetwork } from "@/lib/kotani-pay"
import type { DetailsStepProps } from "./fiat-form-types"

export function DetailsStep(props: DetailsStepProps) {
  const mobile = props.method === "mobile_money"

  return (
    <div className="space-y-4">
      {mobile ? <MobileFields {...props} /> : <BankFields {...props} />}
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={props.onBack}>Back</Button>
        <Button type="button" onClick={props.onContinue} disabled={!props.detailIsComplete}>
          Continue
        </Button>
      </div>
    </div>
  )
}

function MobileFields(props: DetailsStepProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="buyer-phone">Phone number</Label>
        <Input
          id="buyer-phone"
          value={props.buyerPhone}
          onChange={(event) => props.onPhoneChange(event.target.value)}
          placeholder={`${props.dialCode ?? "+254"}...`}
        />
      </div>
      <div className="space-y-2">
        <Label>Network</Label>
        <Select value={props.network} onValueChange={(value) => props.onNetworkChange(value as KotaniNetwork)}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {KOTANI_NETWORKS.map((item) => (
              <SelectItem key={item} value={item}>{item.toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

function BankFields(props: DetailsStepProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="bank-name">Bank name</Label>
        <Input id="bank-name" value={props.bankName} onChange={(event) => props.onBankNameChange(event.target.value)} placeholder="Equity Bank" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bank-ref">Account reference</Label>
        <Input id="bank-ref" value={props.bankAccountRef} onChange={(event) => props.onBankRefChange(event.target.value)} placeholder="Optional" />
      </div>
    </>
  )
}
