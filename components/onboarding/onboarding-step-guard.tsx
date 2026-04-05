"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { OnboardingStep } from "@/lib/onboarding/types"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"

export function useOnboardingStepGuard(step: OnboardingStep) {
  const router = useRouter()
  const { canAccessStep, getFirstIncompleteStep, isHydrated } = useOnboarding()

  useEffect(() => {
    if (!isHydrated) return
    if (canAccessStep(step)) return

    const firstIncomplete = getFirstIncompleteStep()
    router.replace(`/onboarding/${firstIncomplete}`)
  }, [canAccessStep, getFirstIncompleteStep, isHydrated, router, step])

  return { isHydrated }
}
