import { createClient } from "@/lib/supabase/client"
import { TABLENAMES } from "@/lib/supabase/utilities"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { onNavigate } from "@/lib/utils"
import { useEffect, useState } from "react"

export interface OnboardingData {
  id: string
  email: string
  displayName: string
  handle: string
  bio: string
  avatarUrl: string | null
  walletAddress: string
  mpesaNumber: string
  onboardingStep: number
  onboardingComplete: boolean
}

async function createCreator({
  creatorDetails,
}: {
  creatorDetails: OnboardingData
}) {
  if (creatorDetails.avatarUrl === null) {
    toast.error("Image URL absent.")
    return
  }
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !user.id) return

    const blob = await fetch(creatorDetails.avatarUrl).then((res) => res.blob())
    const fileName = `${user.id}.png`
    const { data, error } = await supabase.storage
      .from("xpesa-public")
      .upload(`avatars/${fileName}`, blob, {
        cacheControl: "3600",
      })
    console.log("Image upload error", error)
    const { data: creatorData, error: creatorError } = await supabase
      .from(TABLENAMES.CREATORS)
      .insert({
        id: user.id,
        email: creatorDetails.email,
        display_name: creatorDetails.displayName,
        handle: creatorDetails.handle,
        bio: creatorDetails.bio,
        avatar_url: data?.fullPath,
        wallet_address: creatorDetails.walletAddress,
        mpesa_number: creatorDetails.mpesaNumber,
        onboarding_step: creatorDetails.onboardingStep,
        onboarding_complete: creatorDetails.onboardingComplete,
      })
    console.log("Creator create:", creatorData, creatorError)
  } catch (error) {
    toast.error("Couldn't set up your account. Please try again.")
    throw error
  }
}

async function checkIfUserCompletedOnboarding(): Promise<boolean> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  try {
    const { data, error } = await supabase
      .from(TABLENAMES.CREATORS)
      .select("onboarding_complete")
      .eq("id", user.id)
      .limit(1)

    if (!data || error) {
      return false
    }

    return data[0]?.onboarding_complete === true
  } catch (error) {
    console.log(error)
    return false
  }
}

async function checkIfUserHandleExists(handle: string): Promise<boolean> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from(TABLENAMES.CREATORS)
      .select("handle")
      .eq("handle", handle)
    if (error) {
      console.log("Error checking handle existence: ", error, "Handle: ", data)
      return false
    }
    return data && data.length > 0
  } catch (error) {
    console.log("Error checking handle existence: ", error)
    return false
  }
}

async function checkIfDisplayNameExists(displayName: string): Promise<boolean> {
  const normalizedDisplayName = displayName.trim()
  if (!normalizedDisplayName) return false

  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from(TABLENAMES.CREATORS)
      .select("display_name")
      .ilike("display_name", normalizedDisplayName)
      .limit(1)
    if (error) {
      console.log(
        "Error checking display name existence: ",
        error,
        "Display Name: ",
        data
      )
      return false
    }
    return data && data.length > 0
  } catch (error) {
    console.log("Error checking display name existence: ", error)
    return false
  }
}

export function useDebouncedHandleCheck(handle: string, delay = 500) {
  const [exists, setExists] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!handle) {
      return
    }

    let cancelled = false

    const handler = setTimeout(async () => {
      if (cancelled) return
      setIsChecking(true)
      try {
        const handleExists = await checkIfUserHandleExists(handle)
        if (!cancelled) {
          setExists(handleExists)
        }
      } catch (error) {
        console.log("Error checking handle existence: ", error)
      } finally {
        if (!cancelled) {
          setIsChecking(false)
        }
      }
    }, delay)

    return () => {
      cancelled = true
      clearTimeout(handler)
    }
  }, [handle, delay])

  return {
    exists: handle ? exists : false,
    isChecking: handle ? isChecking : false,
  }
}

export function useDebouncedDisplayNameCheck(displayName: string, delay = 500) {
  const [exists, setExists] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const normalizedDisplayName = displayName.trim()

  useEffect(() => {
    if (!normalizedDisplayName) {
      return
    }

    let cancelled = false

    const handler = setTimeout(async () => {
      if (cancelled) return
      setIsChecking(true)
      try {
        const displayNameExists = await checkIfDisplayNameExists(
          normalizedDisplayName
        )
        if (!cancelled) {
          setExists(displayNameExists)
        }
      } catch (error) {
        console.log("Error checking display name existence: ", error)
      } finally {
        if (!cancelled) {
          setIsChecking(false)
        }
      }
    }, delay)

    return () => {
      cancelled = true
      clearTimeout(handler)
    }
  }, [normalizedDisplayName, delay])

  return {
    exists: normalizedDisplayName ? exists : false,
    isChecking: normalizedDisplayName ? isChecking : false,
  }
}

export function useIsOnboardingComplete() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["onboarding"],
    queryFn: checkIfUserCompletedOnboarding,
  })

  return { data, error, isLoading }
}

export function useCompleteOnboarding() {
  const router = useRouter()
  return useMutation({
    mutationFn: createCreator,
    onSuccess: () => {
      toast.success("Setup complete.", {
        description: "Welcome to Xydra. Get started with our docs.",
        action: {
          label: "Learn more",
          onClick() {
            onNavigate("/learn", router)
          },
        },
      })
      onNavigate("/dashboard", router)
    },
    onError: (error) => {
      console.log(error)
      toast.error("Setup couldn't be completed", {
        description: error.message,
      })
    },
  })
}
