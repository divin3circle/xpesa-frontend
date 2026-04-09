"use client"

import { useMemo, useState } from "react"
import Image from "next/image"

import {
  DocumentUploadZone,
  type UploadedDoc,
} from "@/components/upload/DocumentUploadZone"
import {
  PackUploadZone,
  type PackFileState,
} from "@/components/upload/PackUploadZone"
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

type LinkMode = "gate" | "document" | "pack" | "tip"

const modeCards: Array<{
  mode: LinkMode
  emoji: string
  title: string
  subtitle: string
}> = [
  {
    mode: "gate",
    emoji: "🔗",
    title: "Gate a link",
    subtitle: "Fan pays to unlock your URL",
  },
  {
    mode: "document",
    emoji: "📄",
    title: "Upload a document",
    subtitle: "Single PDF or Word doc. Secure viewer.",
  },
  {
    mode: "pack",
    emoji: "📦",
    title: "Upload a file pack",
    subtitle: "Up to 3 files. All viewed in-browser.",
  },
  {
    mode: "tip",
    emoji: "💚",
    title: "Accept a tip",
    subtitle: "Fan pays what they want. No content needed.",
  },
]

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB"
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function CreateLinkPage() {
  const [mode, setMode] = useState<LinkMode>("gate")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [documentUpload, setDocumentUpload] = useState<UploadedDoc | null>(null)
  const [packFiles, setPackFiles] = useState<PackFileState[]>([])
  const [uploadError, setUploadError] = useState("")
  const [tipMessage, setTipMessage] = useState("Thank you for your support! 🙏")

  const packSummary = useMemo(() => {
    const pdfCount = packFiles.filter((file) => file.fileType === "pdf").length
    const imageCount = packFiles.filter(
      (file) => file.fileType === "image"
    ).length
    const totalBytes = packFiles.reduce(
      (sum, file) => sum + file.fileSizeBytes,
      0
    )

    const breakdown = [
      pdfCount > 0 ? `${pdfCount} PDF` : null,
      imageCount > 0 ? `${imageCount} Image` : null,
    ]
      .filter(Boolean)
      .join(" • ")

    return {
      totalBytes,
      breakdown: breakdown || "No files added",
    }
  }, [packFiles])

  const onDocumentComplete = (result: UploadedDoc) => {
    setDocumentUpload(result)
    setUploadError("")
    if (!title.trim()) {
      setTitle(result.filename.replace(/\.[^/.]+$/, ""))
    }
  }

  const onPackFilesChange = (files: PackFileState[]) => {
    setPackFiles(files)
    if (!title.trim()) {
      const firstReady = files.find((file) => file.status === "ready")
      if (firstReady) {
        setTitle(firstReady.originalFilename.replace(/\.[^/.]+$/, ""))
      }
    }
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
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => setMode(card.mode)}
          >
            <CardHeader className="space-y-1">
              <CardTitle className="font-heading text-lg">
                <span className="mr-2" aria-hidden>
                  {card.emoji}
                </span>
                {card.title}
              </CardTitle>
              <CardDescription>{card.subtitle}</CardDescription>
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
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell fans what they get after payment."
              />
            </div>

            {mode === "gate" ? (
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
                    <Label htmlFor="price-gate">Price (USDC)</Label>
                    <Input id="price-gate" placeholder="12.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry-gate">Access expiry</Label>
                    <select
                      id="expiry-gate"
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
            ) : null}

            {mode === "document" ? (
              <>
                <div className="space-y-2">
                  <Label>Document upload</Label>
                  <DocumentUploadZone
                    value={documentUpload}
                    onUploadComplete={onDocumentComplete}
                    onUploadError={(error) => setUploadError(error)}
                    onRemove={() => setDocumentUpload(null)}
                  />
                  {uploadError ? (
                    <p className="text-xs text-destructive">{uploadError}</p>
                  ) : null}
                </div>

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

                {documentUpload ? (
                  <div className="flex items-center gap-3 rounded-xl border p-3 text-xs text-muted-foreground">
                    {documentUpload.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={documentUpload.thumbnailUrl}
                        alt="Document thumbnail"
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 animate-pulse rounded-md bg-muted" />
                    )}
                    <div>
                      <p>{documentUpload.pageCount} pages</p>
                      <p>{formatBytes(documentUpload.fileSizeBytes)}</p>
                    </div>
                  </div>
                ) : null}

                <details className="rounded-xl border p-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Access Controls
                  </summary>
                  <div className="mt-4 grid gap-3">
                    <label className="flex items-center justify-between text-sm">
                      Expiry
                      <select className="h-9 rounded-md border bg-background px-3 text-xs">
                        <option>Forever</option>
                        <option>One-time only</option>
                        <option>5 minutes</option>
                        <option>1 hour</option>
                        <option>24 hours</option>
                        <option>7 days</option>
                        <option>30 days</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      Max opens
                      <Input
                        className="h-9 max-w-28"
                        placeholder="Unlimited"
                        type="number"
                        min={1}
                      />
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
                      Block download & print
                      <input
                        type="checkbox"
                        defaultChecked
                        className="size-4"
                      />
                    </label>
                  </div>
                </details>
              </>
            ) : null}

            {mode === "pack" ? (
              <>
                <div className="space-y-2">
                  <Label>Pack files</Label>
                  <PackUploadZone
                    files={packFiles}
                    onFilesChange={onPackFilesChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    PDFs and Word docs open in a secure in-browser viewer.
                    Images are also displayed in the viewer - no file downloads
                    for any type.
                  </p>
                </div>

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
                        <option>One-time only</option>
                        <option>5 minutes</option>
                        <option>1 hour</option>
                        <option>24 hours</option>
                        <option>7 days</option>
                        <option>30 days</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      Max opens
                      <Input
                        className="h-9 max-w-28"
                        placeholder="Unlimited"
                        type="number"
                        min={1}
                      />
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
            ) : null}

            {mode === "tip" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tip-amount">Suggested amount (USDC)</Label>
                    <Input
                      id="tip-amount"
                      placeholder="Leave empty for pay-what-you-want"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tip-thank-you">Thank-you message</Label>
                    <Textarea
                      id="tip-thank-you"
                      maxLength={150}
                      value={tipMessage}
                      onChange={(event) => setTipMessage(event.target.value)}
                    />
                    <p className="text-right text-xs text-muted-foreground">
                      {tipMessage.length}/150
                    </p>
                  </div>
                </div>
              </>
            ) : null}

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
                  ? `${packFiles.length} files • ${packSummary.breakdown}`
                  : mode === "document"
                    ? `${documentUpload?.pageCount ?? 0} pages • secure in-browser access`
                    : mode === "tip"
                      ? "Fans can choose any amount to support your work"
                      : "Complete practical guide with project files and implementation checklist."}
              </p>
              <div className="rounded-2xl bg-muted p-3 text-sm">
                <p>Price: {mode === "tip" ? "Custom amount" : "12.00 USDC"}</p>
                <p className="text-muted-foreground">
                  {mode === "pack"
                    ? `${formatBytes(packSummary.totalBytes)}`
                    : mode === "document"
                      ? `${formatBytes(documentUpload?.fileSizeBytes ?? 0)}`
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
