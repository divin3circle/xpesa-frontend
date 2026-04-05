import { OnboardingState, OnboardingStep } from "@/lib/onboarding/types"

export const ONBOARDING_STORAGE_KEY = "xpesa:onboarding"

export const ONBOARDING_STEP_META: Array<{
  step: OnboardingStep
  title: string
  description: string
}> = [
  {
    step: "wallet",
    title: "Set up your wallet",
    description: "Connect or create your payout wallet.",
  },
  {
    step: "handle",
    title: "Choose your handle",
    description: "Pick the public link people will visit.",
  },
  {
    step: "profile",
    title: "Set up your profile",
    description: "Add details people see before they pay.",
  },
]

export const RESERVED_HANDLES = new Set([
  "xpesa",
  "admin",
  "support",
  "creator",
  "payments",
  "dashboard",
])

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  walletAddress: null,
  walletMethod: null,
  handle: "",
  profile: {
    displayName: "",
    bio: "",
    avatarDataUrl: null,
    mpesaNumber: "",
  },
  completedSteps: {
    wallet: false,
    handle: false,
    profile: false,
  },
}
