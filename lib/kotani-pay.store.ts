import { create } from "zustand"

import {
  KOTANI_CALLBACK_URL,
  KOTANI_DEFAULT_COUNTRY_CODE,
  KOTANI_DEFAULT_CURRENCY_CODE,
  KOTANI_DEFAULT_DIAL_CODE,
  KOTANI_DEFAULT_NETWORK,
  KOTANI_DEFAULT_PROVIDER,
  KOTANI_DEFAULT_STEP,
  createKotaniReferenceId,
} from "@/lib/kotani-pay"
import {
  kotaniOfframpDraftSchema,
  type KotaniOfframpDraft,
} from "@/lib/kotani-pay.schema"

export interface KotaniOfframpQuote {
  rateId: string
  rate: number
  estimatedFiatAmount: string
  sourceAmountUsdc: string
  destinationCurrency: KotaniOfframpDraft["currencyCode"]
  fetchedAt: string
}

interface KotaniOfframpState {
  draft: KotaniOfframpDraft
  currentStep: number
  quote: KotaniOfframpQuote | null
  isQuoteLoading: boolean
  quoteError: string | null
  setCurrentStep: (step: number) => void
  setDraft: (patch: Partial<KotaniOfframpDraft>) => void
  setQuote: (quote: KotaniOfframpQuote | null) => void
  setQuoteLoading: (isLoading: boolean) => void
  setQuoteError: (error: string | null) => void
  resetDraft: () => void
}

function buildInitialDraft(): KotaniOfframpDraft {
  return {
    method: "mobile_money",
    countryCode: KOTANI_DEFAULT_COUNTRY_CODE,
    currencyCode: KOTANI_DEFAULT_CURRENCY_CODE,
    network: KOTANI_DEFAULT_NETWORK,
    bankName: "",
    accountName: "",
    mobileCountryCode: KOTANI_DEFAULT_DIAL_CODE,
    mobileNumber: "",
    accountNumber: "",
    address: "",
    amountUsdc: "",
    estimatedFiatAmount: "",
    rateId: "",
    provider: KOTANI_DEFAULT_PROVIDER,
    referenceId: createKotaniReferenceId(),
    callbackUrl: KOTANI_CALLBACK_URL,
    step: KOTANI_DEFAULT_STEP,
  } satisfies KotaniOfframpDraft
}

const initialDraft = buildInitialDraft()

export const useKotaniOfframpStore = create<KotaniOfframpState>((set) => ({
  draft: initialDraft,
  currentStep: KOTANI_DEFAULT_STEP,
  quote: null,
  isQuoteLoading: false,
  quoteError: null,
  setCurrentStep: (step) => set({ currentStep: step }),
  setDraft: (patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...patch,
      },
    })),
  setQuote: (quote) => set({ quote }),
  setQuoteLoading: (isLoading) => set({ isQuoteLoading: isLoading }),
  setQuoteError: (error) => set({ quoteError: error }),
  resetDraft: () =>
    set({
      draft: buildInitialDraft(),
      currentStep: KOTANI_DEFAULT_STEP,
      quote: null,
      isQuoteLoading: false,
      quoteError: null,
    }),
}))

export function getKotaniOfframpDefaults(): KotaniOfframpDraft {
  return buildInitialDraft()
}
