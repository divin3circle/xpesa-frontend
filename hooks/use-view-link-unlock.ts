"use client"

import { useMutation } from "@tanstack/react-query"

type LinkAccessResponse = {
  destinationUrl: string
}

export function useViewLinkUnlock(tokenId?: string) {
  return useMutation({
    mutationFn: async (): Promise<LinkAccessResponse> => {
      if (!tokenId) {
        throw new Error("Token id is required")
      }

      const res = await fetch(`/api/payments/access/${tokenId}`)

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Link expired")
        }

        throw new Error("Failed to unlock link")
      }

      return res.json()
    },
  })
}
