"use client"

import Link from "next/link"
import { usePathname, redirect } from "next/navigation"
import { CheckCircle2, Circle } from "lucide-react"

import { ONBOARDING_STEP_META } from "@/lib/onboarding/constants"
import { OnboardingStep } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { BrandLogo } from "../landing/brand-logo"

function getStepFromPath(pathname: string): OnboardingStep {
  const slug = pathname.split("/")[2]

  if (slug === "wallet" || slug === "handle" || slug === "profile") {
    return slug
  }

  return "wallet"
}

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeStep = getStepFromPath(pathname)
  const { state } = useOnboarding()
  const currentStepIndex = Math.max(
    0,
    ONBOARDING_STEP_META.findIndex((entry) => entry.step === activeStep)
  )
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEP_META.length) * 100

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const errorCode = hashParams.get('error_code');
  const errorDescription = hashParams.get('error_description');

  if (errorCode) {
    redirect(`/error?q=${encodeURIComponent(errorDescription || 'Auth Error')}`)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.15),transparent_45%),linear-gradient(145deg,hsl(var(--background)),hsl(var(--muted)/0.5))] p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] overflow-hidden backdrop-blur md:grid-cols-[320px_1fr] md:p-0">
        <aside className="bg-[linear-gradient(180deg,hsl(var(--chart-5)),hsl(var(--chart-4)))] p-6 text-white md:p-8">
          <div className="items-left mb-8 flex flex-col gap-3">
            <BrandLogo tone="default" />
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">
                Welcome to the onboarding
              </p>
              <p className="text-sm text-foreground/75">
                Set up in under 2 minutes
              </p>
            </div>
          </div>

          <nav className="space-y-5">
            {ONBOARDING_STEP_META.map((entry, index) => {
              const isActive = entry.step === activeStep
              const isComplete = state.completedSteps[entry.step]

              return (
                <Link
                  key={entry.step}
                  href={`/onboarding/${entry.step}`}
                  className={cn(
                    "group flex items-start gap-3 rounded-2xl p-3 transition-colors",
                    isActive ? "bg-foreground/10" : "hover:bg-foreground/5"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-full">
                    {isComplete ? (
                      <CheckCircle2 className="size-6 text-chart-1" />
                    ) : (
                      <Circle className="size-6 text-foreground/50" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs tracking-[0.2em] text-foreground/70 uppercase">
                      Step {index + 1}
                    </p>
                    <p className="font-medium text-foreground">{entry.title}</p>
                    <p className="text-sm text-foreground/75">
                      {entry.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="flex flex-col bg-background/60 p-6 md:p-10">
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>
                {currentStepIndex + 1}/{ONBOARDING_STEP_META.length}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
