"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit01FreeIcons } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"

type LinkMode = "gate" | "document" | "pack" | "tip"

type DocumentUploadState = {
  fileName: string
  fileSizeBytes: number
  pageCount: number
  status: "ready"
}

type PackFileState = {
  id: string
  name: string
  fileSizeBytes: number
  fileType: "pdf" | "docx" | "image"
  pageCount?: number
  dimensions?: string
}

const modeCards: Array<{
  mode: LinkMode
  emoji: string
  title: string
  body: string
}> = [
  {
    mode: "gate",
    emoji: "🔗",
    title: "Gate Link",
    body: "Fan pays to unlock your destination URL.",
  },
  {
    mode: "document",
    emoji: "📄",
    title: "Document",
    body: "Single PDF or Word doc with secure in-browser viewing.",
  },
  {
    mode: "pack",
    emoji: "📦",
    title: "File Pack",
    body: "Up to 3 files. One payment unlocks the full pack.",
  },
  {
    mode: "tip",
    emoji: "💚",
    title: "Tip",
    body: "Fans support you with pay-what-they-want tips.",
  },
]

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileType(file: File): PackFileState["fileType"] {
  const extension = file.name.split(".").pop()?.toLowerCase()
  if (extension === "pdf") return "pdf"
  if (extension === "docx") return "docx"
  return "image"
}

export default function CreateLinkPage() {
  const [mode, setMode] = useState<LinkMode>("gate")
  const [title, setTitle] = useState("")
  const [documentUpload, setDocumentUpload] =
    useState<DocumentUploadState | null>(null)
  const [packFiles, setPackFiles] = useState<PackFileState[]>([])
  const [draggingPackFileId, setDraggingPackFileId] = useState<string | null>(
    null
  )

  const packBreakdown = useMemo(() => {
    const counts = {
      pdf: packFiles.filter((file) => file.fileType === "pdf").length,
      docx: packFiles.filter((file) => file.fileType === "docx").length,
      image: packFiles.filter((file) => file.fileType === "image").length,
    }

    return [
      counts.pdf > 0 ? `${counts.pdf} PDF` : null,
      counts.docx > 0 ? `${counts.docx} DOCX` : null,
      counts.image > 0 ? `${counts.image} Image` : null,
    ]
      .filter(Boolean)
      .join(" • ")
  }, [packFiles])

  const packTotalSize = useMemo(
    () => packFiles.reduce((sum, file) => sum + file.fileSizeBytes, 0),
    [packFiles]
  )

  const updateTitleIfEmpty = (nextTitle: string) => {
    setTitle((currentTitle) =>
      currentTitle.trim().length === 0 ? nextTitle : currentTitle
    )
  }

  const handleDocumentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    updateTitleIfEmpty(file.name.replace(/\.[^/.]+$/, ""))

    setDocumentUpload({
      fileName: file.name,
      fileSizeBytes: file.size,
      pageCount: 1,
      status: "ready",
    })
  }

  const handlePackSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    const availableSlots = Math.max(0, 3 - packFiles.length)
    const filesToAdd = selectedFiles.slice(0, availableSlots)

    const nextItems = await Promise.all(
      filesToAdd.map(async (file) => {
        const id = `${file.name}-${file.lastModified}`
        const fileType = getFileType(file)

        if (fileType === "image") {
          const url = URL.createObjectURL(file)
          const dimensions = await new Promise<string>((resolve) => {
            const img = new window.Image()
            img.onload = () => {
              resolve(`${img.width}x${img.height}`)
              URL.revokeObjectURL(url)
            }
            img.onerror = () => {
              resolve("Unknown")
              URL.revokeObjectURL(url)
            }
            img.src = url
          })

          return {
            id,
            name: file.name,
            fileSizeBytes: file.size,
            fileType,
            dimensions,
          } as PackFileState
        }

        return {
          id,
          name: file.name,
          fileSizeBytes: file.size,
          fileType,
          pageCount: 1,
        } as PackFileState
      })
    )

    const firstFileName = nextItems[0]?.name
    if (firstFileName) {
      updateTitleIfEmpty(firstFileName.replace(/\.[^/.]+$/, ""))
    }

    setPackFiles((current) => [...current, ...nextItems])
    event.target.value = ""
  }

  const removePackFile = (id: string) => {
    setPackFiles((current) => current.filter((file) => file.id !== id))
  }

  const reorderPackFiles = (draggedId: string, targetId: string) => {
    setPackFiles((current) => {
      const draggedIndex = current.findIndex((item) => item.id === draggedId)
      const targetIndex = current.findIndex((item) => item.id === targetId)
      if (
        draggedIndex === -1 ||
        targetIndex === -1 ||
        draggedIndex === targetIndex
      ) {
        return current
      }
      const next = [...current]
      const [dragged] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, dragged)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Create link
        </h1>
        <p className="text-sm text-muted-foreground">
          Build gate links, documents, file packs, and tip links with fan-ready
          preview.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {modeCards.map((card) => (
          <Card
            key={card.mode}
            className={`cursor-pointer border transition-colors ${
              mode === card.mode
                ? "border-primary"
                : "border-muted hover:border-primary/40"
            }`}
            onClick={() => setMode(card.mode)}
          >
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                <span className="mr-2" aria-hidden>
                  {card.emoji}
                </span>
                {card.title}
              </CardTitle>
              <CardDescription>{card.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Link details</CardTitle>
            <CardDescription>
              Keep it short, clear, and conversion-friendly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="React Native Crash Course"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell fans what they get after payment."
              />
            </div>

            {mode === "gate" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination URL</Label>
                  <Input
                    id="destination"
                    placeholder="https://example.com/private-resource"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USDC)</Label>
                    <Input id="price" placeholder="12.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Access expiry</Label>
                    <select
                      id="expiry"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option>Forever</option>
                      <option>One-time only</option>
                      <option>24 hours</option>
                      <option>7 days</option>
                      <option>30 days</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {mode === "document" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="document">Document upload</Label>
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleDocumentSelect}
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepts PDF (50MB max) and DOCX (20MB max).
                  </p>
                </div>
                {documentUpload && (
                  <div className="rounded-xl border p-3 text-sm">
                    <p className="font-medium">{documentUpload.fileName}</p>
                    <p className="text-muted-foreground">
                      {documentUpload.pageCount} pages •{" "}
                      {formatBytes(documentUpload.fileSizeBytes)}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setDocumentUpload(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price-document">Price (USDC)</Label>
                    <Input id="price-document" placeholder="12.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-document">Thumbnail</Label>
                    <Input
                      id="thumbnail-document"
                      type="file"
                      accept="image/*"
                    />
                  </div>
                </div>
                <details className="rounded-xl border p-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Access Controls
                  </summary>
                  <div className="mt-4 grid gap-3">
                    <label className="flex items-center justify-between text-sm">
                      Expiry
                      <select className="h-9 rounded-md border bg-background px-3 text-xs">
                        <option>Forever</option>
                        <option>24 hours</option>
                        <option>7 days</option>
                        <option>30 days</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      Max views
                      <Input className="h-9 max-w-28" placeholder="Unlimited" />
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      IP binding
                      <input type="checkbox" className="size-4" />
                    </label>
                    <label className="flex items-center justify-between text-sm text-muted-foreground">
                      Wallet binding (always on)
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        disabled
                        className="size-4"
                      />
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      Wallet watermark
                      <input
                        type="checkbox"
                        defaultChecked
                        className="size-4"
                      />
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      Download block
                      <input
                        type="checkbox"
                        defaultChecked
                        className="size-4"
                      />
                    </label>
                  </div>
                </details>
              </>
            )}

            {mode === "pack" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pack-files">Pack files</Label>
                  <Input
                    id="pack-files"
                    type="file"
                    multiple
                    disabled={packFiles.length >= 3}
                    accept=".pdf,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={handlePackSelect}
                  />
                  <p className="text-xs text-muted-foreground">
                    {packFiles.length} / 3 files added
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDFs and Word docs are viewed securely in-browser. Images
                    are displayed in the viewer with no file downloads.
                  </p>
                </div>
                {packFiles.length > 0 && (
                  <div className="space-y-2 rounded-xl border p-3">
                    {packFiles.map((file) => (
                      <div
                        key={file.id}
                        draggable
                        onDragStart={() => setDraggingPackFileId(file.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (draggingPackFileId) {
                            reorderPackFiles(draggingPackFileId, file.id)
                          }
                          setDraggingPackFileId(null)
                        }}
                        className="flex items-center justify-between gap-3 rounded-lg border p-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.fileType.toUpperCase()} •{" "}
                            {formatBytes(file.fileSizeBytes)}
                            {file.pageCount ? ` • ${file.pageCount} pages` : ""}
                            {file.dimensions ? ` • ${file.dimensions}` : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePackFile(file.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      {packBreakdown} • {formatBytes(packTotalSize)}
                    </p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price-pack">Price (USDC)</Label>
                    <Input id="price-pack" placeholder="20.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-pack">Thumbnail</Label>
                    <Input id="thumbnail-pack" type="file" accept="image/*" />
                  </div>
                </div>
                <details className="rounded-xl border p-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Access Controls
                  </summary>
                  <div className="mt-4 grid gap-3">
                    <label className="flex items-center justify-between text-sm">
                      Expiry
                      <select className="h-9 rounded-md border bg-background px-3 text-xs">
                        <option>Forever</option>
                        <option>24 hours</option>
                        <option>7 days</option>
                        <option>30 days</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      Max views
                      <Input className="h-9 max-w-28" placeholder="Unlimited" />
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      IP binding
                      <input type="checkbox" className="size-4" />
                    </label>
                    <label className="flex items-center justify-between text-sm text-muted-foreground">
                      Wallet binding (always on)
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        disabled
                        className="size-4"
                      />
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      Wallet watermark
                      <input
                        type="checkbox"
                        defaultChecked
                        className="size-4"
                      />
                    </label>
                  </div>
                </details>
              </>
            )}

            {mode === "tip" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tip-amount">Suggested amount (USDC)</Label>
                    <Input id="tip-amount" placeholder="2.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tip-thank-you">Thank-you message</Label>
                    <Input
                      id="tip-thank-you"
                      maxLength={150}
                      defaultValue="Thank you for your support! 🙏"
                    />
                  </div>
                </div>
              </>
            )}

            {(mode === "gate" || mode === "tip") && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Suggested $1
                </Button>
                <Button variant="outline" size="sm">
                  Suggested $2
                </Button>
                <Button variant="outline" size="sm">
                  Suggested $5
                </Button>
                <Button variant="outline" size="sm">
                  Suggested $10
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button>Create link</Button>
              <Button variant="secondary">Save draft</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-1 xl:col-span-2">
          <CardHeader>
            <CardTitle>Fan preview</CardTitle>
            <CardDescription>
              What your audience sees before payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="-mt-0.5">
            <div className="group relative mb-2 cursor-pointer">
              <Image
                src="/icon.png"
                alt="Wallet"
                width={200}
                height={100}
                className="w-full rounded-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/75 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <HugeiconsIcon
                  icon={Edit01FreeIcons}
                  className="size-5 text-chart-1"
                />
                <p className="mt-2 text-sm">Upload custom Thumbnail</p>
              </div>
            </div>
            <div className="space-y-3 rounded-xl border p-4">
              <Badge>{mode === "tip" ? "Support" : "Locked content"}</Badge>
              <p className="font-medium">
                {title.trim().length > 0 ? title : "React Native Crash Course"}
              </p>
              <p className="text-sm text-muted-foreground">
                {mode === "pack"
                  ? `${packFiles.length || 0} files in this bundle`
                  : mode === "document"
                    ? "Secure in-browser document access"
                    : mode === "tip"
                      ? "Fans can choose any amount to support your work"
                      : "Complete practical guide with project files and implementation checklist."}
              </p>
              <div className="rounded-2xl bg-muted p-3 text-sm">
                <p>Price: {mode === "tip" ? "Custom amount" : "12.00 USDC"}</p>
                <p className="text-muted-foreground">
                  {mode === "pack"
                    ? `${packBreakdown || "No files added"}`
                    : mode === "document"
                      ? `${documentUpload?.pageCount ?? 0} pages`
                      : "~ KES 1,548"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
