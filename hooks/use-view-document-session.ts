"use client"

import { useMemo, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { useWalletSessionSignature } from "@/hooks/use-wallet-session-signature"
import { viewerDocumentMock } from "@/lib/mock/view"

export type OpenResponse =
  | {
      pageCount: number
      title: string
      watermarkEnabled: boolean
      downloadBlocked: boolean
      linkId?: string
      requiredWallet?: string
      viewsRemaining?: number
      expiresIn?: string
    }
  | {
      error: "expired" | "wrong_wallet" | "view_limit_reached" | "ip_mismatch"
      linkId?: string
      requiredWallet?: string
    }

export type DocumentSigningState = "idle" | "signing" | "signed"

export type DocumentSessionError =
  | "expired"
  | "wrong_wallet"
  | "view_limit_reached"
  | "ip_mismatch"
  | null

function truncateWallet(wallet: string) {
  if (wallet.length < 12) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export function useViewDocumentSession(tokenId?: string) {
  const [walletAddress, setWalletAddress] = useState("")
  const [signingWalletAddress, setSigningWalletAddress] = useState("")
  const [signature, setSignature] = useState("")
  const [signingState, setSigningState] = useState<DocumentSigningState>("idle")
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle")
  const [error, setError] = useState<DocumentSessionError>(null)
  const [title, setTitle] = useState(viewerDocumentMock.title)
  const [pageUrls, setPageUrls] = useState<string[]>([])
  const [linkId, setLinkId] = useState<string | undefined>(undefined)
  const [requiredWallet, setRequiredWallet] = useState<string | undefined>(
    undefined
  )
  const [viewsRemaining, setViewsRemaining] = useState<number | undefined>(
    undefined
  )
  const [expiresIn, setExpiresIn] = useState("Forever")

  const signWalletSession = useWalletSessionSignature()

  const openDocumentMutation = useMutation({
    mutationFn: async ({
      walletAddress,
      signature,
      tokenId,
    }: {
      walletAddress: string
      signingWalletAddress: string
      signature: string
      tokenId: string
    }) => {
      const openRes = await fetch(`/api/docs/open/${tokenId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          signingWalletAddress,
          signature,
        }),
      })

      const openData = (await openRes.json()) as OpenResponse

      if ("error" in openData) {
        return { openData, pages: [] as string[] }
      }

      const pageNums = Array.from(
        { length: Math.max(openData.pageCount, 1) },
        (_, index) => index + 1
      )

      const pagesRes = await fetch(`/api/docs/pages/${tokenId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          signingWalletAddress,
          signature,
          pageNums,
        }),
      })

      const pagesData = (await pagesRes.json()) as {
        pages?: string[]
      }

      const pages = pagesData.pages ?? []

      return { openData, pages }
    },
  })

  const watermarkText = useMemo(
    () => truncateWallet(walletAddress),
    [walletAddress]
  )

  const signSession = async () => {
    if (!walletAddress || !tokenId) return

    setSigningState("signing")

    try {
      const signed = await signWalletSession.mutateAsync({
        tokenId,
        expectedWalletAddress: walletAddress,
      })

      setWalletAddress(signed.walletAddress)
      setSigningWalletAddress(
        signed.signingWalletAddress ?? signed.walletAddress
      )
      setSignature(signed.signature)
      setSigningState("signed")
      toast.success("Session signed", {
        description: "You can now open the document.",
      })
    } catch (err) {
      const message = (err as Error).message || "Unknown error"
      toast.error("Failed to sign message", {
        description: message,
      })
      setSigningState("idle")
    }
  }

  const openDocument = async () => {
    if (!walletAddress || !signature || !tokenId) return

    setStatus("loading")
    setError(null)

    try {
      const { openData, pages } = await openDocumentMutation.mutateAsync({
        walletAddress,
        signingWalletAddress,
        signature,
        tokenId,
      })

      if ("error" in openData) {
        setError(openData.error)
        setLinkId(openData.linkId)
        setRequiredWallet(openData.requiredWallet)
        setStatus("idle")
        return
      }

      setTitle(openData.title)
      setLinkId(openData.linkId)
      setRequiredWallet(openData.requiredWallet)
      setViewsRemaining(openData.viewsRemaining)
      setExpiresIn(openData.expiresIn ?? "Unlimited")
      setPageUrls(pages)
      setStatus("ready")
    } catch {
      setError("expired")
      setStatus("idle")
    }
  }

  const resetSession = () => {
    setSignature("")
    setSigningState("idle")
    setPageUrls([])
    setStatus("idle")
  }

  return {
    walletAddress,
    setWalletAddress,
    signature,
    signingState,
    status,
    error,
    title,
    pageUrls,
    linkId,
    requiredWallet,
    viewsRemaining,
    expiresIn,
    watermarkText,
    signSession,
    openDocument,
    resetSession,
  }
}
