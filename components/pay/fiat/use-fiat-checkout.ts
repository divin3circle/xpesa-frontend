import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { PublicLinkDetails } from "@/app/api/public/links/route"
import { KOTANI_COUNTRY_OPTIONS, type KotaniNetwork } from "@/lib/kotani-pay"
import type { FiatPaymentStatus } from "@/lib/payments/fiat"
import { getFiatStatusDescription, getFiatStatusMessage } from "./messages"
import type { FiatCheckoutStep, FiatPaymentIntent, FiatQuote } from "./types"

function isTerminalStatus(status?: FiatPaymentStatus) {
  return status === "access_issued" || status === "failed" || status === "expired"
}

export function useFiatCheckout({
  link,
  amount,
}: {
  link: PublicLinkDetails
  amount: number
}) {
  const router = useRouter()
  const [currencyCode, setCurrencyCode] = useState("KES")
  const [countryCode, setCountryCode] = useState("KE")
  const [network, setNetwork] = useState<KotaniNetwork>("mpesa")
  const [buyerPhone, setBuyerPhone] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccountRef, setBankAccountRef] = useState("")
  const [quote, setQuote] = useState<FiatQuote | null>(null)
  const [intent, setIntent] = useState<FiatPaymentIntent | null>(null)
  const [isQuoting, setIsQuoting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [step, setStep] = useState<FiatCheckoutStep>("quote")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const selectedCountry = useMemo(
    () => KOTANI_COUNTRY_OPTIONS.find((option) => option.code === countryCode),
    [countryCode]
  )

  async function createQuote() {
    setIsQuoting(true)
    try {
      const response = await fetch("/api/payments/fiat/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsdc: amount, fiatCurrency: currencyCode }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Quote failed")
      setQuote(body.quote)
      setStep("details")
      return body.quote as FiatQuote
    } finally {
      setIsQuoting(false)
    }
  }

  async function routeAccess(nextIntent: FiatPaymentIntent) {
    const token = nextIntent.access_token_id
    if (!token) return
    if (link.type === "gate") {
      const urlRes = await fetch(`/api/payments/access/${token}`)
      window.location.href = (await urlRes.json()).destinationUrl
      return
    }
    router.push(
      link.type === "tip" ? `/pay/${link.id}/thankyou?token=${token}` : `/view/${token}`
    )
  }

  async function pollIntent(intentId: string) {
    setIsPolling(true)
    try {
      for (let attempt = 0; attempt < 60; attempt += 1) {
        const response = await fetch(`/api/payments/fiat/intents/${intentId}`)
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || "Status check failed")
        const nextIntent = body.intent as FiatPaymentIntent
        setIntent(nextIntent)
        if (nextIntent.status === "access_issued") {
          toast.success("Payment confirmed")
          await routeAccess(nextIntent)
          return
        }
        if (isTerminalStatus(nextIntent.status)) {
          toast.error(
            getFiatStatusMessage(nextIntent.status, nextIntent.failure_message),
            {
              description: getFiatStatusDescription(
                nextIntent.failure_message
              ),
            }
          )
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
      toast.info("Payment is still processing", {
        description: "You can refresh this page to check again.",
      })
    } finally {
      setIsPolling(false)
    }
  }

  return {
    state: { currencyCode, countryCode, network, buyerPhone, bankName, bankAccountRef, quote, intent, isQuoting, isCreating, isPolling, step, isDialogOpen, selectedCountry },
    actions: { setCurrencyCode, setCountryCode, setNetwork, setBuyerPhone, setBankName, setBankAccountRef, setQuote, setIntent, setIsCreating, setStep, setIsDialogOpen, createQuote, pollIntent },
  }
}
