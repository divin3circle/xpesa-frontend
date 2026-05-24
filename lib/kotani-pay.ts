import { envConfig } from "@/lib/env"

export type KotaniOfframpMethod = "mobile_money" | "bank_transfer"
export type KotaniCountryCode = "KE" | "UG" | "TZ" | "ZM"
export type KotaniCurrencyCode = "KES" | "UGX" | "TZS" | "ZMW"
export type KotaniDialCode = "+254" | "+255" | "+256" | "+263"
export type KotaniNetwork = "mpesa" | "airtel" | "mtn" | "vodafone"

export interface KotaniSupportOption {
  name: string
  image: string
}

export interface KotaniOfframpStep {
  step: number
  title: string
  description: string
}

export interface KotaniOfframpOption {
  id: number
  method: KotaniOfframpMethod
  name: string
  description: string
  supports: KotaniSupportOption[]
}

export interface KotaniCountryOption {
  code: KotaniCountryCode
  name: string
  currency: KotaniCurrencyCode
  dialCode: KotaniDialCode
}

export interface KotaniCurrencyOption {
  code: KotaniCurrencyCode
  label: string
}

export const KOTANI_DEFAULT_STEP = 1
export const KOTANI_TOTAL_STEPS = 4
export const KOTANI_DEFAULT_COUNTRY_CODE: KotaniCountryCode = "KE"
export const KOTANI_DEFAULT_CURRENCY_CODE: KotaniCurrencyCode = "KES"
export const KOTANI_DEFAULT_DIAL_CODE: KotaniDialCode = "+254"
export const KOTANI_DEFAULT_NETWORK: KotaniNetwork = "mpesa"
export const KOTANI_DEFAULT_PROVIDER = "Kotani Pay"
export const KOTANI_CALLBACK_URL = `${envConfig.APP_URL}/api/payments/confirm`

export const KOTANI_COUNTRY_CODES = ["KE", "UG", "TZ", "ZM"] as const
export const KOTANI_CURRENCY_CODES = ["KES", "UGX", "TZS", "ZMW"] as const
export const KOTANI_DIAL_CODES = ["+254", "+255", "+256", "+263"] as const
export const KOTANI_NETWORKS = ["mpesa", "airtel", "mtn", "vodafone"] as const
export const KOTANI_OFFRAMP_METHODS = ["mobile_money", "bank_transfer"] as const

export const KOTANI_OFFRAMP_STEPS: KotaniOfframpStep[] = [
  {
    step: 1,
    title: "Choose an Offramp Option",
    description: "Where do you want your fiat to land?",
  },
  {
    step: 2,
    title: "Enter Details",
    description: "Which details should we use to send the money?",
  },
  {
    step: 3,
    title: "Enter Withdraw Amount",
    description: "How much crypto do you want to withdraw?",
  },
  {
    step: 4,
    title: "Confirm & Process",
    description: "Are these details correct?",
  },
]

export const KOTANI_MOBILE_MONEY_OPTIONS: KotaniSupportOption[] = [
  {
    name: "Safaricom(M-Pesa)",
    image: "/saf.jpg",
  },
  {
    name: "MTN Mobile",
    image: "/mtn.svg",
  },
  {
    name: "Airtel Money",
    image: "/airtel.png",
  },
]

export const KOTANI_BANK_OPTIONS: KotaniSupportOption[] = [
  {
    name: "Equity Bank",
    image: "/equity.png",
  },
  {
    name: "ABSA Bank",
    image: "/absa.jpg",
  },
  {
    name: "KCB Bank",
    image: "/kcb.jpeg",
  },
  {
    name: "Standard Chartered",
    image: "/stanchart.png",
  },
]

export const KOTANI_OFFRAMP_OPTIONS: KotaniOfframpOption[] = [
  {
    id: 1,
    method: "mobile_money",
    name: "Mobile Money",
    description:
      "Convert your digital assets into local mobile money instantly. With support for more than 14 countries and 5 popular carriers.",
    supports: KOTANI_MOBILE_MONEY_OPTIONS,
  },
  {
    id: 2,
    method: "bank_transfer",
    name: "Bank Transfer",
    description:
      "Convert your digital assets into local bank accounts instantly. Supports major regional banks with real-time settlement.",
    supports: KOTANI_BANK_OPTIONS,
  },
]

export const KOTANI_COUNTRY_OPTIONS: KotaniCountryOption[] = [
  {
    code: "KE",
    name: "Kenya",
    currency: "KES",
    dialCode: "+254",
  },
  {
    code: "UG",
    name: "Uganda",
    currency: "UGX",
    dialCode: "+256",
  },
  {
    code: "TZ",
    name: "Tanzania",
    currency: "TZS",
    dialCode: "+255",
  },
  {
    code: "ZM",
    name: "Zimbabwe",
    currency: "ZMW",
    dialCode: "+263",
  },
]

export const KOTANI_CURRENCY_OPTIONS: KotaniCurrencyOption[] = [
  {
    code: "KES",
    label: "KES",
  },
  {
    code: "UGX",
    label: "UGX",
  },
  {
    code: "TZS",
    label: "TZS",
  },
  {
    code: "ZMW",
    label: "ZMW",
  },
]

export const KOTANI_FALLBACK_RATES: Partial<
  Record<KotaniCurrencyCode, number>
> = {
  KES: 130,
  UGX: 3700,
  TZS: 2500,
  ZMW: 26,
}

export function createKotaniReferenceId() {
  return `kotani-${Date.now()}`
}
