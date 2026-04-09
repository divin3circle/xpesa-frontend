"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"

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

const fallbackFiles: PackFile[] = [
  {
    packFileId: "f1",
    originalFilename: "algebra-revision.pdf",
    fileType: "pdf",
    sortOrder: 0,
  },
  {
    packFileId: "f2",
    originalFilename: "branding-cover.png",
    fileType: "image",
    sortOrder: 1,
  },
  {
    packFileId: "f3",
    originalFilename: "chemistry-quicksheet.pdf",
    fileType: "pdf",
    sortOrder: 2,
  },
]

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

  const walletWatermark = useMemo(
    () => truncateWallet(walletAddress),
    [walletAddress]
  )

  const signSession = () => {
    if (!walletAddress) return
    setSignature(`xpesa-open:${tokenId}:${walletAddress}`)
  }

  const openPack = async () => {
    if (!tokenId || !walletAddress || !signature) return

    try {
      const res = await fetch(`/api/packs/open/${tokenId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      })
      const data = (await res.json()) as {
        title?: string
        files?: PackFile[]
      }

      const nextFiles = data.files?.length ? data.files : fallbackFiles
      setTitle(data.title ?? "Locked file pack")
      setFiles(nextFiles)
      setSelectedFile(nextFiles[0] ?? null)
    } catch {
      setFiles(fallbackFiles)
      setSelectedFile(fallbackFiles[0])
    }
  }

  const fetchPackFile = async (file: PackFile) => {
    if (!tokenId || !walletAddress || !signature) return

    setSelectedFile(file)

    try {
      const res = await fetch(`/api/packs/file/${tokenId}/${file.packFileId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      })

      const data = (await res.json()) as { signedUrl?: string }
      setSelectedFileUrl(data.signedUrl ?? "")
    } catch {
      setSelectedFileUrl("")
    }
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
        <div className="space-y-1">
          <p className="font-heading text-lg font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">
            {files.length || 0} files
          </p>
        </div>
        <Badge variant="secondary">Public viewer</Badge>
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
            {(files.length ? files : fallbackFiles).map((file) => (
              <button
                key={file.packFileId}
                type="button"
                onClick={() => fetchPackFile(file)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  selectedFile?.packFileId === file.packFileId
                    ? "border-primary"
                    : "border-muted"
                }`}
              >
                <p className="font-medium">{file.originalFilename}</p>
                <p className="text-xs text-muted-foreground">
                  {file.fileType.toUpperCase()}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <div
          className="relative min-h-[70vh] rounded-2xl border"
          onContextMenu={(event) => event.preventDefault()}
        >
          {selectedFile ? (
            selectedFile.fileType === "pdf" ? (
              <iframe
                title={selectedFile.originalFilename}
                src={selectedFileUrl}
                className="h-[70vh] w-full rounded-2xl"
              />
            ) : (
              <div className="flex h-[70vh] items-center justify-center p-4">
                {selectedFileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedFileUrl}
                    alt={selectedFile.originalFilename}
                    className="max-h-[66vh] w-auto rounded-xl object-contain"
                    draggable={false}
                    onContextMenu={(event) => event.preventDefault()}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click a file to load its secure URL.
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">
              Select a file to start viewing.
            </div>
          )}
          <p className="pointer-events-none absolute right-4 bottom-4 font-mono text-xs text-black/20 select-none">
            {walletWatermark}
          </p>
        </div>
      </section>
    </div>
  )
}
