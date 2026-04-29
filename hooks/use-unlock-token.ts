"use client"

import { useMutation } from "@tanstack/react-query"
import { useWalletSessionSignature } from "./use-wallet-session-signature"

export type PageAccessResponse = {
  title: string
  pageCount: number | null
  watermarkEnabled: boolean
  downloadBlocked: boolean
  linkId: string
  requiredWallet: string
  viewsRemaining: number | null
  expiresIn: number | null
  signedUrl: string
}

export type PackAccessResponse = {
  title: string
  files: {
    id: string
    original_filename: string
    file_type: string
    sort_order: number
  }[]
  watermarkEnabled: boolean
  expiresAt: string | null
  viewsRemaining: number | null
  signedUrl: string
}

type UnlockResult = PageAccessResponse | PackAccessResponse

export function useUnlockToken(
  tokenId?: string,
  linkType?: "document" | "pack"
) {
  const signSession = useWalletSessionSignature()

  const unlock = useMutation({
    mutationFn: async (): Promise<UnlockResult> => {
      if (!tokenId) throw new Error("Token id is required")
      if (!linkType) throw new Error("Link type is required")

      const signed = await signSession.mutateAsync({ tokenId })

      const endpoint =
        linkType === "pack"
          ? `/api/packs/open/${tokenId}`
          : `/api/docs/open/${tokenId}`

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: signed.walletAddress,
          signature: signed.signature,
        }),
      })

      if (!res.ok) {
        if (res.status === 403)
          throw new Error("Access denied or token expired")
        throw new Error("Failed to unlock content")
      }

      return res.json()
    },
  })

  return {
    ...unlock,
    isAuthorizing: unlock.isPending || signSession.isPending,
  }
}
