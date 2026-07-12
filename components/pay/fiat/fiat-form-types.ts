import type { KotaniNetwork } from "@/lib/kotani-pay"
import type { FiatPaymentMethod } from "@/lib/payments/fiat"

export type DetailsStepProps = {
  method: FiatPaymentMethod
  buyerPhone: string
  bankName: string
  bankAccountRef: string
  network: KotaniNetwork
  dialCode?: string
  detailIsComplete: boolean
  onPhoneChange: (value: string) => void
  onBankNameChange: (value: string) => void
  onBankRefChange: (value: string) => void
  onNetworkChange: (value: KotaniNetwork) => void
  onBack: () => void
  onContinue: () => void
}
