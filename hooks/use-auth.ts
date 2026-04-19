import { createClient } from "@/lib/supabase/client"
import { envConfig, onNavigate } from "@/lib/utils"
import { AuthError, Session, User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useIsOnboardingComplete } from "./use-onboarding"

interface AuthResponse {
  data: {
    user: User | null
    session: Session | null
  }
  error: AuthError | null
}

async function signOutUser() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    toast.success("Signed out successfully")
  } catch (error) {
    console.error("Error signing out:", error)
    toast.error("Failed to sign out. Please try again.")
  }
}

async function signUpNewUser({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<AuthResponse> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: envConfig.APP_URL + "/onboarding",
      },
    })
    return { data, error }
  } catch (error) {
    console.error("Error signing up:", error)
    toast.error("Failed to sign up. Please try again.")
    return {
      data: {
        user: null,
        session: null,
      },
      error: error as AuthError,
    }
  }
}

async function signInUser({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<AuthResponse> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    console.log("Error signing in user:", error)
    return {
      data: {
        user: null,
        session: null,
      },
      error: error as AuthError,
    }
  }
}

export function useSignUp() {
  const router = useRouter()
  return useMutation({
    mutationFn: signUpNewUser,
    onSuccess: (response) => {
      if (response.error) {
        toast.error(response.error.message)
      } else {
        toast.success("Great! You're in", {
          description:
            " Let's get you onboarded. In the meantime, check your email to confirm your account.",
        })

        onNavigate("/onboarding", router)
      }
    },
    onError: (error) => {
      console.error("Error during sign up:", error)
      toast.error("An unexpected error occurred. Please try again.")
    },
  })
}

export function useSignIn() {
  const router = useRouter()
  const { data } = useIsOnboardingComplete()
  return useMutation({
    mutationFn: signInUser,
    onSuccess: (response) => {
      if (!data) {
        toast.success("Welcome back! Let's finish setting up your account.")
        onNavigate("/onboarding", router)
        return
      }
      if (response.error) {
        toast.error(response.error.message)
      } else {
        toast.success("Welcome back creator!")
        onNavigate("/dashboard", router)
      }
    },
    onError: (error) => {
      console.log("Error during signin in:", error)
      toast.error("Couldn't sign you in", {
        description: error.message,
      })
    },
  })
}

export function useSignOut() {
  const router = useRouter()
  return useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      onNavigate("/login", router)
    },
    onError: (error) => {
      console.error("Error during sign out:", error)
      toast.error("Failed to sign out. Please try again.")
    },
  })
}
