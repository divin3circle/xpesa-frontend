"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export interface WaitlistParams {
  name: string
  email: string
  creatorFocus: string
  notes: string
}

async function submitWaitlist(params: WaitlistParams): Promise<void> {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    throw new Error(payload?.error || "Could not join the waitlist.")
  }
}

export function useWaitlist() {
  return useMutation({
    mutationFn: submitWaitlist,
    onSuccess: () => {
      toast.success("Submission successful",
        {
          description: "Thanks for showing interest in XPesa. We'll get back to within 2-3 days.",
        })
    },
    onError: error => {
      toast.error(error.message)
    }
  }

  )
}
