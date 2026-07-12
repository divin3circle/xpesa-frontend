"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Gift } from "lucide-react"

import type { PublicLinkDetails } from "@/app/api/public/links/route"
import { Button } from "@/components/ui/button"

export function FreeAccessButton({ link }: { link: PublicLinkDetails }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleFreeAccess() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/payments/free-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: link.id }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Failed to unlock")

      if (body.linkType === "gate") {
        const access = await fetch(`/api/payments/access/${body.accessToken}`)
        const payload = await access.json()
        if (!access.ok) throw new Error(payload.error || "Failed to open link")
        window.location.href = payload.destinationUrl
        return
      }

      if (body.linkType === "tip") {
        router.push(`/pay/${link.id}/thankyou?token=${body.accessToken}&free=1`)
        return
      }

      router.push(`/view/${body.accessToken}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unlock")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleFreeAccess}
      disabled={isLoading}
      className="h-12 w-full rounded-2xl"
    >
      <Gift className="size-4" />
      {isLoading ? "Unlocking..." : "Get Free Access"}
    </Button>
  )
}
