"use client"

import { useCallback, useState } from "react"
import { useActiveAccount } from "thirdweb/react"

/**
 * Drives the non-custodial creator offramp from the client:
 *   initiate (POST /api/withdrawals) -> sign EIP-3009 typed data with the connected wallet ->
 *   authorize (POST .../authorize) -> poll status (GET .../[id]).
 * The wallet signs; the server relays. Funds never touch a platform wallet.
 */

export type WithdrawalFlowStatus =
  | "idle"
  | "creating"
  | "signing"
  | "authorizing"
  | "processing"
  | "paid"
  | "failed"

export type WithdrawalFlowParams = {
  amountUsdc: number
  mpesaNumber: string
  network: string
  accountName?: string
  fiatCurrency?: string
}

const POLL_INTERVAL_MS = 3000
const POLL_ATTEMPTS = 40

export function useWithdrawalFlow() {
  const account = useActiveAccount()
  const [status, setStatus] = useState<WithdrawalFlowStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setError(null)
    setReceipt(null)
    setTxHash(null)
  }, [])

  const submit = useCallback(
    async (params: WithdrawalFlowParams) => {
      if (!account) {
        setError("Connect your wallet to withdraw")
        setStatus("failed")
        return
      }
      setError(null)
      setReceipt(null)
      setTxHash(null)
      try {
        setStatus("creating")
        const idempotencyKey = `${account.address}-${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`
        const initRes = await fetch("/api/withdrawals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...params, idempotencyKey }),
        })
        const initData = await initRes.json().catch(() => ({}))
        if (!initRes.ok) {
          throw new Error(initData.error || "Failed to start withdrawal")
        }
        const { withdrawalId, typedData } = initData

        setStatus("signing")
        const signature = await account.signTypedData(typedData)

        setStatus("authorizing")
        const authRes = await fetch(
          `/api/withdrawals/${withdrawalId}/authorize`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authorization: typedData.message,
              signature,
            }),
          }
        )
        const authData = await authRes.json().catch(() => ({}))
        if (!authRes.ok) {
          throw new Error(authData.error || "Failed to authorize withdrawal")
        }
        setTxHash(authData.txHash ?? null)

        setStatus("processing")
        for (let i = 0; i < POLL_ATTEMPTS; i++) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
          const sRes = await fetch(`/api/withdrawals/${withdrawalId}`)
          const s = await sRes.json().catch(() => ({}))
          if (s.status === "paid") {
            setReceipt(s.mpesaReceipt ?? null)
            setStatus("paid")
            return
          }
          if (s.status === "failed" || s.status === "refunded") {
            setStatus("failed")
            setError("Withdrawal did not complete")
            return
          }
        }
        // Timed out waiting; the reconciler will finalize it. Leave as processing.
      } catch (e) {
        setError(e instanceof Error ? e.message : "Withdrawal failed")
        setStatus("failed")
      }
    },
    [account]
  )

  const isSubmitting = !["idle", "paid", "failed"].includes(status)
  return { status, error, receipt, txHash, submit, reset, isSubmitting }
}
