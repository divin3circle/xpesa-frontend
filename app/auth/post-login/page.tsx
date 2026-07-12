import { redirect } from "next/navigation"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { TABLENAMES } from "@/lib/supabase/utilities"

export default async function PostLoginGatePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: creatorRows, error } = await supabase
    .from(TABLENAMES.CREATORS)
    .select("onboarding_complete")
    .eq("id", user.id)
    .limit(1)

  if (error) {
    redirect("/error?q=Unable%20to%20resolve%20account%20state")
  }

  const onboardingComplete = creatorRows?.[0]?.onboarding_complete === true

  if (onboardingComplete) {
    redirect("/dashboard")
  }

  redirect("/onboarding/wallet")
}
