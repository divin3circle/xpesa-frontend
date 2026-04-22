import { OnboardingProvider } from "@/components/onboarding/onboarding-provider"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { TABLENAMES } from "@/lib/supabase/utilities"
import { redirect } from "next/navigation"

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: creatorRows, error: creatorError } = await supabase
    .from(TABLENAMES.CREATORS)
    .select("onboarding_complete")
    .eq("id", user.id)
    .limit(1)

  if (creatorError) {
    redirect("/error?q=Unable%20to%20verify%20onboarding%20status")
  }

  const onboardingComplete = creatorRows?.[0]?.onboarding_complete === true
  if (onboardingComplete) {
    redirect("/dashboard")
  }

  return (
    <OnboardingProvider>
      <OnboardingShell>{children}</OnboardingShell>
    </OnboardingProvider>
  )
}
