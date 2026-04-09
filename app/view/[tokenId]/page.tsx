"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type OpenResponse =
  | {
      pageCount: number
      title: string
      watermarkEnabled: boolean
      downloadBlocked: boolean
      linkId?: string
    }
  | {
      error: "expired" | "wrong_wallet" | "view_limit_reached"
      linkId?: string
    }

function truncateWallet(wallet: string) {
  if (wallet.length < 12) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export default function DocumentViewerPage() {
  const params = useParams<{ tokenId: string }>()
  const tokenId = params?.tokenId

  const [walletAddress, setWalletAddress] = useState("")
  const [signature, setSignature] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle")
  const [error, setError] = useState<
    "expired" | "wrong_wallet" | "view_limit_reached" | null
  >(null)
  const [title, setTitle] = useState("Locked document")
  const [pageUrls, setPageUrls] = useState<string[]>([])
  const [expiresIn] = useState("30m")

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isSave =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s"
      if (isSave) {
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const watermarkText = useMemo(
    () => truncateWallet(walletAddress),
    [walletAddress]
  )

  const signSession = () => {
    if (!walletAddress) return
    setSignature(`xpesa-open:${tokenId}:${walletAddress}`)
  }

  const openDocument = async () => {
    if (!walletAddress || !signature || !tokenId) return

    setStatus("loading")
    setError(null)

    try {
      const openRes = await fetch(`/api/docs/open/${tokenId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      })

      const openData = (await openRes.json()) as OpenResponse

      if ("error" in openData) {
        setError(openData.error)
        setStatus("idle")
        return
      }

      setTitle(openData.title)

      const pagesRes = await fetch(`/api/docs/pages/${tokenId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature, pageNums: [1] }),
      })

      const pagesData = (await pagesRes.json()) as {
        pages?: string[]
        signedUrl?: string
        error?: string
      }

      const pages =
        pagesData.pages ?? (pagesData.signedUrl ? [pagesData.signedUrl] : [])
      setPageUrls(pages)
      setStatus("ready")
    } catch {
      setError("expired")
      setStatus("idle")
    }
  }

  if (error === "expired") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Access expired</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Your access token has expired.</p>
            <Button asChild>
              <Link href="/pay/demo-link">Pay again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error === "wrong_wallet") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Wrong wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Connect wallet {truncateWallet(walletAddress)} to view this
              document.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error === "view_limit_reached") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>View limit reached</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>This document has reached its maximum opens.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
        <div className="space-y-1">
          <p className="font-heading text-lg font-semibold">xpesa</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <Badge variant="secondary">Expires in {expiresIn}</Badge>
      </header>

      {!walletAddress || !signature ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet address</Label>
              <Input
                id="wallet"
                placeholder="0x..."
                value={walletAddress}
                onChange={(event) => setWalletAddress(event.target.value)}
              />
            </div>
            <Button onClick={signSession} disabled={!walletAddress}>
              Sign session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={openDocument} disabled={status === "loading"}>
          {status === "loading" ? "Opening..." : "Open document"}
        </Button>
      )}

      <div
        className="relative min-h-[70vh] rounded-2xl border"
        onContextMenu={(event) => event.preventDefault()}
      >
        {pageUrls[0] ? (
          <iframe
            src={pageUrls[0]}
            className="h-[70vh] w-full rounded-2xl"
            title="Document"
          />
        ) : (
          <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">
            Open the document to start viewing.
          </div>
        )}
        <p className="pointer-events-none absolute right-4 bottom-4 font-mono text-xs text-black/20 select-none">
          {watermarkText}
        </p>
      </div>
    </div>
  )
}
