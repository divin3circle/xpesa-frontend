import { OnboardingProvider } from "@/components/onboarding/onboarding-provider"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <OnboardingProvider>
      <OnboardingShell>{children}</OnboardingShell>
    </OnboardingProvider>
  )
}
