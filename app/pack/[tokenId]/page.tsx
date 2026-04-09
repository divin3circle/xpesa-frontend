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

type PackFile = {
  packFileId: string
  originalFilename: string
  fileType: "pdf" | "image"
  sortOrder: number
}

type OpenPackResponse =
  | {
      title: string
      files: PackFile[]
      watermarkEnabled?: boolean
      expiresAt?: string
      viewsRemaining?: number
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

export default function PackViewerPage() {
  const params = useParams<{ tokenId: string }>()
  const tokenId = params?.tokenId

  const [walletAddress, setWalletAddress] = useState("")
  const [signature, setSignature] = useState("")
  const [title, setTitle] = useState("Locked file pack")
  const [files, setFiles] = useState<PackFile[]>([])
  const [selectedFile, setSelectedFile] = useState<PackFile | null>(null)
  const [selectedFileUrl, setSelectedFileUrl] = useState("")
  const [error, setError] = useState<
    "expired" | "wrong_wallet" | "view_limit_reached" | "ip_mismatch" | null
  >(null)
  const [linkId, setLinkId] = useState<string | undefined>(undefined)
  const [requiredWallet, setRequiredWallet] = useState<string | undefined>(
    undefined
  )
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined)
  const [viewsRemaining, setViewsRemaining] = useState<number | undefined>(
    undefined
  )

  const walletWatermark = useMemo(
    () => truncateWallet(walletAddress),
    [walletAddress]
  )

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

  const signSession = () => {
    if (!walletAddress) return
    setSignature(`xpesa-open:${tokenId}:${walletAddress}`)
  }

  const handleFileClick = async (file: PackFile) => {
    if (!tokenId || !walletAddress || !signature) return

    setSelectedFile(file)

    try {
      const response = await fetch(
        `/api/packs/file/${tokenId}/${file.packFileId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress, signature }),
        }
      )

      const data = (await response.json()) as { signedUrl?: string }
      setSelectedFileUrl(data.signedUrl ?? "")
    } catch {
      setSelectedFileUrl("")
    }
  }

  const openPack = async () => {
    if (!tokenId || !walletAddress || !signature) return

    setError(null)

    try {
      const response = await fetch(`/api/packs/open/${tokenId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      })

      const data = (await response.json()) as OpenPackResponse

      if ("error" in data) {
        setError(data.error)
        setLinkId(data.linkId)
        setRequiredWallet(data.requiredWallet)
        return
      }

      const sortedFiles = [...(data.files ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder
      )
      setTitle(data.title)
      setFiles(sortedFiles)
      setExpiresAt(data.expiresAt)
      setViewsRemaining(data.viewsRemaining)

      if (sortedFiles[0]) {
        await handleFileClick(sortedFiles[0])
      }
    } catch {
      setError("expired")
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
            This pack has reached its maximum opens.
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
          <p className="font-heading text-lg font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{files.length} files</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {expiresAt ? `Expires ${expiresAt}` : "Forever"}
          </Badge>
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
            <div className="flex gap-2">
              <Button onClick={signSession} disabled={!walletAddress}>
                Sign session
              </Button>
              <Button
                variant="secondary"
                onClick={openPack}
                disabled={!signature}
              >
                Open pack
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border p-3">
          <p className="mb-3 text-sm font-medium">Files</p>
          <div className="grid gap-2 lg:block">
            {files.map((file) => (
              <button
                key={file.packFileId}
                type="button"
                onClick={() => handleFileClick(file)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  selectedFile?.packFileId === file.packFileId
                    ? "border-primary bg-muted"
                    : "border-muted"
                }`}
              >
                <p className="truncate font-medium">{file.originalFilename}</p>
                <p className="text-xs text-muted-foreground">
                  {file.fileType.toUpperCase()}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <div
          className="relative min-h-[70vh] rounded-2xl border p-2"
          onContextMenu={(event) => event.preventDefault()}
        >
          {selectedFile ? (
            selectedFile.fileType === "pdf" ? (
              selectedFileUrl ? (
                <SecurePdfViewer
                  fileUrl={selectedFileUrl}
                  walletWatermark={walletWatermark}
                />
              ) : (
                <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">
                  Loading PDF...
                </div>
              )
            ) : (
              <div className="relative flex h-[70vh] items-center justify-center p-4">
                {selectedFileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedFileUrl}
                    alt={selectedFile.originalFilename}
                    className="max-h-[66vh] w-auto rounded-xl object-contain select-none"
                    draggable={false}
                    onContextMenu={(event) => event.preventDefault()}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Loading image...
                  </p>
                )}
                <p className="pointer-events-none absolute right-4 bottom-4 font-mono text-xs text-black/20 select-none">
                  {walletWatermark}
                </p>
              </div>
            )
          ) : (
            <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">
              Select a file to start viewing.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
