"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

const CONSENT_KEY = "xpesa_cookie_consent"
const COOKIE_POLICY_URL = "/policies-and-terms#cookie-policy"

export function CookieConsentToast() {
  const hasShown = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (hasShown.current) {
      return
    }

    hasShown.current = true

    if (typeof window === "undefined") {
      return
    }

    try {
      if (window.localStorage.getItem(CONSENT_KEY) === "accepted") {
        return
      }
    } catch {
      return
    }

    toast.custom(
      (t) => (
        <div className="flex w-[min(92vw,420px)] flex-col gap-4 rounded-3xl border border-border/70 bg-background p-4 shadow-lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              We use cookies to keep your session secure and improve the
              experience.
            </p>
            <p className="text-xs text-muted-foreground">
              Accept to continue or click the button below to review the Cookie Policy for details.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                try {
                  window.localStorage.setItem(CONSENT_KEY, "accepted")
                } catch {
                  // Ignore storage failures and dismiss the toast anyway.
                }
                toast.dismiss(t)
              }}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                toast.dismiss(t)
                router.push(COOKIE_POLICY_URL)
              }}
            >
              View policy
            </Button>
          </div>
        </div>
      ),
      {
        id: "cookie-consent",
        duration: Number.POSITIVE_INFINITY,
      }
    )
  }, [router])

  return null
}
