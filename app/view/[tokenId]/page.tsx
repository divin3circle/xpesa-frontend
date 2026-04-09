"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"

import { ExpiryOverlay } from "@/components/viewer/ExpiryOverlay"
import { SecurePdfViewer } from "@/components/viewer/SecurePdfViewer"
import { WrongWalletMessage } from "@/components/viewer/WrongWalletMessage"
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
      requiredWallet?: string
      viewsRemaining?: number
      expiresIn?: string
    }
  | {
      error: "expired" | "wrong_wallet" | "view_limit_reached" | "ip_mismatch"
      linkId?: string
      requiredWallet?: string
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
    "expired" | "wrong_wallet" | "view_limit_reached" | "ip_mismatch" | null
  >(null)
  const [title, setTitle] = useState("Locked document")
  const [pageUrls, setPageUrls] = useState<string[]>([])
  const [linkId, setLinkId] = useState<string | undefined>(undefined)
  const [requiredWallet, setRequiredWallet] = useState<string | undefined>(
    undefined
  )
  const [viewsRemaining, setViewsRemaining] = useState<number | undefined>(
    undefined
  )
  const [expiresIn, setExpiresIn] = useState("Forever")

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const shouldBlock =
        (event.metaKey || event.ctrlKey) && (key === "s" || key === "p")
      if (shouldBlock) {
        event.preventDefault()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
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
        setLinkId(openData.linkId)
        setRequiredWallet(openData.requiredWallet)
        setStatus("idle")
        return
      }

      setTitle(openData.title)
      setLinkId(openData.linkId)
      setRequiredWallet(openData.requiredWallet)
      setViewsRemaining(openData.viewsRemaining)
      setExpiresIn(openData.expiresIn ?? "Forever")

      const pageNums = Array.from(
        { length: Math.max(openData.pageCount, 1) },
        (_, index) => index + 1
      )

      const pagesRes = await fetch(`/api/docs/pages/${tokenId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature, pageNums }),
      })

      const pagesData = (await pagesRes.json()) as {
        pages?: string[]
        signedUrl?: string
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
    return <ExpiryOverlay linkId={linkId} />
  }

  if (error === "wrong_wallet") {
    return <WrongWalletMessage requiredWallet={requiredWallet} />
  }

  if (error === "view_limit_reached") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>View limit reached</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This document has reached its maximum opens.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error === "ip_mismatch") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>IP mismatch detected</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This link is restricted to the network used at payment time.
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
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Expires in {expiresIn}</Badge>
          {typeof viewsRemaining === "number" ? (
            <Badge variant="outline">{viewsRemaining} opens left</Badge>
          ) : null}
        </div>
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

      {status === "ready" && pageUrls[0] ? (
        <SecurePdfViewer
          fileUrl={pageUrls[0]}
          walletWatermark={watermarkText}
        />
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border text-sm text-muted-foreground">
          Open the document to start viewing.
        </div>
      )}
    </div>
  )
}
