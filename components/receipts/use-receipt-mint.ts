"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ReceiptMintRecord } from "./types"

export function useReceiptMint(accessToken?: string | null) {
  const [receipt, setReceipt] = useState<ReceiptMintRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMinting, setIsMinting] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    setIsLoading(true)
    fetch(`/api/receipts?accessToken=${encodeURIComponent(accessToken)}`)
      .then((res) => res.json())
      .then((body) => setReceipt(body.receipt ?? null))
      .catch(() => setReceipt(null))
      .finally(() => setIsLoading(false))
  }, [accessToken])

  async function mint(recipientWalletAddress: string) {
    if (!accessToken) return
    setIsMinting(true)
    try {
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, recipientWalletAddress }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Mint failed")
      setReceipt(body.receipt)
      toast.success("Supporter receipt minted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Mint failed")
    } finally {
      setIsMinting(false)
    }
  }

  return { receipt, isLoading, isMinting, mint }
}
