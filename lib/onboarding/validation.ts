import { OnboardingStep } from "@/lib/onboarding/types"

export const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,30}$/
export const MPESA_REGEX = /^(07|01)\d{8}$/

export function isHandleValid(handle: string): boolean {
  return HANDLE_REGEX.test(handle)
}

export function isMpesaValid(mpesaNumber: string): boolean {
  return MPESA_REGEX.test(mpesaNumber)
}

export function getStepIndex(step: OnboardingStep): number {
  return ["wallet", "handle", "profile"].indexOf(step)
}
