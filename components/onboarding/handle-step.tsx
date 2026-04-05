"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OnboardingStepHeader } from "@/components/onboarding/step-header"
import { useOnboardingStepGuard } from "@/components/onboarding/onboarding-step-guard"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { RESERVED_HANDLES } from "@/lib/onboarding/constants"
import { isHandleValid } from "@/lib/onboarding/validation"

type HandleStatus = "idle" | "checking" | "available" | "taken" | "invalid"

export function HandleStep() {
  useOnboardingStepGuard("handle")

  const router = useRouter()
  const { state, setHandle, markStepComplete } = useOnboarding()
  const [handle, setHandleValue] = useState(state.handle)
  const [debouncedHandle, setDebouncedHandle] = useState(state.handle)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedHandle(handle)
    }, 500)

    return () => window.clearTimeout(timer)
  }, [handle])

  const status = useMemo<HandleStatus>(() => {
    if (!handle) return "idle"
    if (!isHandleValid(handle)) return "invalid"
    if (debouncedHandle !== handle) return "checking"

    const isTaken = RESERVED_HANDLES.has(handle.toLowerCase())
    return isTaken ? "taken" : "available"
  }, [debouncedHandle, handle])

  const statusText = useMemo(() => {
    if (status === "available") return "Handle is available"
    if (status === "taken") return "This handle is already taken"
    if (status === "invalid") {
      return "Use 3-30 characters, letters, numbers, or underscores"
    }
    if (status === "checking") return "Checking availability..."
    return ""
  }, [status])

  function handleContinue() {
    if (status !== "available") return

    setHandle(handle)
    markStepComplete("handle")
    router.push("/onboarding/profile")
  }

  return (
    <section>
      <OnboardingStepHeader step="handle" />

      <div className="max-w-xl space-y-3">
        <label className="text-sm font-medium">Handle</label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            xpesa.com/
          </span>
          <Input
            value={handle}
            onChange={(event) =>
              setHandleValue(event.target.value.replace(/\s+/g, ""))
            }
            placeholder="your_handle"
            className="pl-24"
            autoComplete="off"
          />
        </div>

        <div className="flex min-h-5 items-center gap-2 text-sm">
          {status === "available" ? (
            <CheckCircle2 className="size-4 text-primary" />
          ) : null}
          {status === "taken" || status === "invalid" ? (
            <XCircle className="size-4 text-destructive" />
          ) : null}
          {status === "checking" ? (
            <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
          ) : null}
          <p
            className={
              status === "available"
                ? "text-primary"
                : status === "taken" || status === "invalid"
                  ? "text-destructive"
                  : "text-muted-foreground"
            }
          >
            {statusText}
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-muted/30 p-4 text-sm">
          <p className="font-medium">Preview</p>
          <p className="mt-1 text-muted-foreground">
            Your page will be at xpesa.com/{handle || "your_handle"}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Button
          type="button"
          size="lg"
          disabled={status !== "available"}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </section>
  )
}
