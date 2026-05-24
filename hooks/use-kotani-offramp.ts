"use client"

import { useShallow } from "zustand/shallow"

import { useKotaniOfframpStore } from "@/lib/kotani-pay.store"

export function useKotaniOfframp() {
  return useKotaniOfframpStore(
    useShallow((state) => ({
      draft: state.draft,
      currentStep: state.currentStep,
      quote: state.quote,
      isQuoteLoading: state.isQuoteLoading,
      quoteError: state.quoteError,
      setCurrentStep: state.setCurrentStep,
      setDraft: state.setDraft,
      setQuote: state.setQuote,
      setQuoteLoading: state.setQuoteLoading,
      setQuoteError: state.setQuoteError,
      resetDraft: state.resetDraft,
    }))
  )
}
