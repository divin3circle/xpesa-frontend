export const ONBOARDING_STEP_ORDER = ["wallet", "handle", "profile"] as const

export type OnboardingStep = (typeof ONBOARDING_STEP_ORDER)[number]

export type WalletMethod = "existing" | "embedded"

export interface OnboardingProfileInput {
  displayName: string
  bio: string
  avatarDataUrl: string | null
  mpesaNumber: string
}

export interface OnboardingState {
  walletAddress: string | null
  walletMethod: WalletMethod | null
  handle: string
  profile: OnboardingProfileInput
  completedSteps: Record<OnboardingStep, boolean>
}

export interface OnboardingPayload {
  walletAddress: string
  walletMethod: WalletMethod
  handle: string
  profile: OnboardingProfileInput
  onboardingComplete: true
}
