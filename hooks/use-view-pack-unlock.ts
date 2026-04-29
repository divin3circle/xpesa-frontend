"use client"

import { useMutation } from "@tanstack/react-query"

import { useWalletSessionSignature } from "@/hooks/use-wallet-session-signature"

export type PackFile = {
  id: string
  original_filename: string
  file_type: string
  sort_order: number
}

export type PackMetadata = {
  title: string
  files: PackFile[]
  watermarkEnabled: boolean
  expiresAt: string | null
  viewsRemaining: number | null
}

export function useViewPackUnlock(tokenId?: string) {
  const signSession = useWalletSessionSignature()

  const openPack = useMutation({
    mutationFn: async (): Promise<PackMetadata> => {
      if (!tokenId) {
        throw new Error("Token id is required")
      }

      const signed = await signSession.mutateAsync({ tokenId })

      const res = await fetch(`/api/packs/open/${tokenId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: signed.walletAddress,
          signingWalletAddress: signed.signingWalletAddress,
          signature: signed.signature,
        }),
      })

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Pack expired or access denied")
        }

        throw new Error("Failed to unlock pack")
      }

      return res.json()
    },
  })

  return {
    ...openPack,
    isPending: openPack.isPending || signSession.isPending,
  }
}
