import { z } from "zod"

import {
  KOTANI_CALLBACK_URL,
  KOTANI_COUNTRY_CODES,
  KOTANI_CURRENCY_CODES,
  KOTANI_DEFAULT_COUNTRY_CODE,
  KOTANI_DEFAULT_CURRENCY_CODE,
  KOTANI_DEFAULT_DIAL_CODE,
  KOTANI_DEFAULT_NETWORK,
  KOTANI_DEFAULT_PROVIDER,
  KOTANI_DEFAULT_STEP,
  KOTANI_DIAL_CODES,
  KOTANI_NETWORKS,
  KOTANI_OFFRAMP_METHODS,
  KOTANI_TOTAL_STEPS,
} from "@/lib/kotani-pay"

const positiveMoneyText = z
  .string()
  .trim()
  .min(1, "Enter an amount")
  .refine((value) => {
    const amount = Number(value)
    return Number.isFinite(amount) && amount > 0
  }, "Amount must be greater than zero")

export const kotaniOfframpMethodSchema = z.enum(KOTANI_OFFRAMP_METHODS)
export const kotaniCountryCodeSchema = z.enum(KOTANI_COUNTRY_CODES)
export const kotaniCurrencyCodeSchema = z.enum(KOTANI_CURRENCY_CODES)
export const kotaniDialCodeSchema = z.enum(KOTANI_DIAL_CODES)
export const kotaniNetworkSchema = z.enum(KOTANI_NETWORKS)

export const kotaniOfframpSelectionSchema = z.object({
  method: kotaniOfframpMethodSchema.default("mobile_money"),
  countryCode: kotaniCountryCodeSchema.default(KOTANI_DEFAULT_COUNTRY_CODE),
  currencyCode: kotaniCurrencyCodeSchema.default(KOTANI_DEFAULT_CURRENCY_CODE),
  network: kotaniNetworkSchema.default(KOTANI_DEFAULT_NETWORK),
  bankName: z.string().trim().optional().default(""),
})

export const kotaniOfframpBeneficiarySchema = z.object({
  accountName: z.string().trim().min(2, "Account name is required"),
  mobileCountryCode: kotaniDialCodeSchema.default(KOTANI_DEFAULT_DIAL_CODE),
  mobileNumber: z.string().trim().min(6, "Mobile number is required"),
  accountNumber: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
})

export const kotaniOfframpQuoteSchema = z.object({
  amountUsdc: positiveMoneyText,
  estimatedFiatAmount: z.string().trim().optional().default(""),
  rateId: z.string().trim().optional().default(""),
  provider: z.string().trim().default(KOTANI_DEFAULT_PROVIDER),
  referenceId: z.string().trim().min(1, "Reference ID is required"),
  callbackUrl: z.string().url().default(KOTANI_CALLBACK_URL),
  step: z
    .number()
    .int()
    .min(1)
    .max(KOTANI_TOTAL_STEPS)
    .default(KOTANI_DEFAULT_STEP),
})

export const kotaniOfframpDraftSchema = kotaniOfframpSelectionSchema
  .merge(kotaniOfframpBeneficiarySchema)
  .merge(kotaniOfframpQuoteSchema)

export type KotaniOfframpDraft = z.infer<typeof kotaniOfframpDraftSchema>

export const kotaniOfframpStepSchemas = {
  1: kotaniOfframpSelectionSchema,
  2: kotaniOfframpBeneficiarySchema,
  3: kotaniOfframpQuoteSchema,
  4: kotaniOfframpDraftSchema,
} as const

export function getKotaniOfframpStepSchema(step: number) {
  return (
    kotaniOfframpStepSchemas[step as keyof typeof kotaniOfframpStepSchemas] ??
    kotaniOfframpDraftSchema
  )
}
