"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  INITIAL_ONBOARDING_STATE,
  ONBOARDING_STORAGE_KEY,
} from "@/lib/onboarding/constants"
import {
  OnboardingPayload,
  OnboardingProfileInput,
  OnboardingState,
  OnboardingStep,
  ONBOARDING_STEP_ORDER,
  WalletMethod,
} from "@/lib/onboarding/types"
import { useIsOnboardingComplete } from "@/hooks/use-onboarding"
import { redirect } from "next/navigation"
import LoadingSpinner from "../ui/loading-spinner"

interface OnboardingContextValue {
  state: OnboardingState
  isHydrated: boolean
  setWallet: (walletAddress: string, method: WalletMethod) => void
  setHandle: (handle: string) => void
  setProfile: (input: Partial<OnboardingProfileInput>) => void
  markStepComplete: (step: OnboardingStep) => void
  canAccessStep: (step: OnboardingStep) => boolean
  getFirstIncompleteStep: () => OnboardingStep
  getPayload: () => OnboardingPayload | null
  reset: () => void
}
const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data, error, isLoading } = useIsOnboardingComplete()

  const [state, setState] = useState<OnboardingState>(INITIAL_ONBOARDING_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const raw = window.sessionStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (raw) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(JSON.parse(raw) as OnboardingState)
      } catch {
        // Ignoring bad serialized data and continue with defaults.
      }
    }

    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    window.sessionStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state))
  }, [state, isHydrated])

  const setWallet = useCallback(
    (walletAddress: string, method: WalletMethod) => {
      setState((prev) => ({
        ...prev,
        walletAddress,
        walletMethod: method,
      }))
    },
    []
  )

  const setHandle = useCallback((handle: string) => {
    setState((prev) => ({
      ...prev,
      handle,
    }))
  }, [])

  const setProfile = useCallback((input: Partial<OnboardingProfileInput>) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...input,
      },
    }))
  }, [])

  const markStepComplete = useCallback((step: OnboardingStep) => {
    setState((prev) => ({
      ...prev,
      completedSteps: {
        ...prev.completedSteps,
        [step]: true,
      },
    }))
  }, [])

  const canAccessStep = useCallback(
    (step: OnboardingStep) => {
      const stepIndex = ONBOARDING_STEP_ORDER.indexOf(step)
      if (stepIndex <= 0) return true

      const requiredPreviousSteps = ONBOARDING_STEP_ORDER.slice(0, stepIndex)
      return requiredPreviousSteps.every(
        (requiredStep) => state.completedSteps[requiredStep]
      )
    },
    [state.completedSteps]
  )

  const getFirstIncompleteStep = useCallback((): OnboardingStep => {
    for (const step of ONBOARDING_STEP_ORDER) {
      if (!state.completedSteps[step]) {
        return step
      }
    }
    return "profile"
  }, [state.completedSteps])

  const getPayload = useCallback((): OnboardingPayload | null => {
    if (!state.walletAddress || !state.walletMethod || !state.handle) {
      return null
    }

    return {
      walletAddress: state.walletAddress,
      walletMethod: state.walletMethod,
      handle: state.handle,
      profile: state.profile,
      onboardingComplete: true,
    }
  }, [state])

  const reset = useCallback(() => {
    setState(INITIAL_ONBOARDING_STATE)
    window.sessionStorage.removeItem(ONBOARDING_STORAGE_KEY)
  }, [])

  const value = useMemo<OnboardingContextValue>(
    () => ({
      state,
      isHydrated,
      setWallet,
      setHandle,
      setProfile,
      markStepComplete,
      canAccessStep,
      getFirstIncompleteStep,
      getPayload,
      reset,
    }),
    [
      state,
      isHydrated,
      setWallet,
      setHandle,
      setProfile,
      markStepComplete,
      canAccessStep,
      getFirstIncompleteStep,
      getPayload,
      reset,
    ]
  )

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <h1 className="mb- font-sans font-semibold text-muted-foreground">
          Just a moment..
        </h1>
        <LoadingSpinner size={5} />
      </div>
    )
  }
  if (error) {
    redirect(`/error?q=${error.message}`)
  }
  if (data) {
    redirect("/dashboard")
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used inside OnboardingProvider")
  }

  return context
}
