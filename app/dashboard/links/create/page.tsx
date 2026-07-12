"use client"

import React, { ChangeEvent, useMemo, useState } from "react"
import Image from "next/image"

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
import {
  DocumentCodeIcon,
  Link01Icon,
  Package01Icon,
  TipsIcon,
} from "hugeicons-react"
import { useCreateLink } from "@/hooks/use-links"
import LoadingSpinner from "@/components/ui/loading-spinner"
import type { CreateLinkParams } from "@/hooks/use-links"
import { createClient } from "@/lib/supabase/client"
import {
  getUploadErrorMessage,
  uploadDocumentAndFinalize,
  uploadPackAndFinalize,
} from "@/lib/links/upload-client"
import {
  acceptedUploadTypes,
  classifyFileByExtension,
  validatePackSelection,
  validateSingleUpload,
  type SupportedFileKind,
} from "@/lib/links/file-policy"
import type { PackFileCreateInput } from "@/lib/links/types"
import { toast } from "sonner"

type UploadedDoc = {
  r2Key: string
  pageCount: number | null
  fileSizeBytes: number
  filename: string
  fileType?: SupportedFileKind
}

type SelectedPackFile = {
  id: string
  file: File
  fileType: SupportedFileKind
}

type LinkMode = "gate" | "document" | "pack" | "tip"

const modeCards: Array<{
  mode: LinkMode
  emoji: React.ReactNode
  title: string
  subtitle: string
}> = [
  {
    mode: "gate",
    emoji: <Link01Icon />,
    title: "Gate a link",
    subtitle: "Fan pays to unlock your a URL with premium content.",
  },
  {
    mode: "document",
    emoji: <DocumentCodeIcon />,
    title: "Upload a file",
    subtitle: "Single file up to 50MB with secured access.",
  },
  {
    mode: "pack",
    emoji: <Package01Icon />,
    title: "Upload a file pack",
    subtitle: "Up to 3 files, 150MB total.",
  },
  {
    mode: "tip",
    emoji: <TipsIcon />,
    title: "Accept a tip",
    subtitle: "Fan pays what they want. No content needed.",
  },
]

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB"
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return undefined

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const KES_PER_USDC = 129

function formatKesFromUsdc(value: string) {
  const amount = parseOptionalNumber(value)
  if (!amount || amount <= 0) return "KES 0"

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount * KES_PER_USDC)
}

type LinkFormValues = {
  mode: LinkMode
  title: string
  description: string
  thumbnailDataUrl: string
  destinationUrl: string
  gatePriceUsdc: string
  documentPriceUsdc: string
  packPriceUsdc: string
  tipSuggestedAmountUsdc: string
  tipMessage: string
  accessExpiryType: string
  documentUpload: UploadedDoc | null
  selectedPackFiles: SelectedPackFile[]
  finalizedPackSizeBytes?: number
  finalizedPackR2Key?: string
  finalizedPackFiles?: PackFileCreateInput[]
}

function buildCreateLinkParams({
  mode,
  title,
  description,
  thumbnailDataUrl,
  destinationUrl,
  gatePriceUsdc,
  documentPriceUsdc,
  packPriceUsdc,
  tipSuggestedAmountUsdc,
  tipMessage,
  accessExpiryType,
  documentUpload,
  selectedPackFiles,
  finalizedPackSizeBytes,
  finalizedPackR2Key,
  finalizedPackFiles,
}: LinkFormValues): {
  params: CreateLinkParams | null
  errorMessage: string | null
} {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) {
    return {
      params: null,
      errorMessage: "Please add a title before creating a link.",
    }
  }

  const trimmedDescription = description.trim()
  if (mode !== "tip" && !thumbnailDataUrl) {
    return {
      params: null,
      errorMessage: "Please add a thumbnail before creating this link.",
    }
  }

  switch (mode) {
    case "tip":
      return {
        params: {
          type: "tip",
          title: trimmedTitle,
          description: trimmedDescription,
          thankYouMessage: tipMessage,
          suggestedAmountUsdc: parseOptionalNumber(tipSuggestedAmountUsdc),
        },
        errorMessage: null,
      }

    case "gate": {
      const trimmedDestinationUrl = destinationUrl.trim()
      if (!trimmedDestinationUrl) {
        return {
          params: null,
          errorMessage: "Please add a destination URL for the gated link.",
        }
      }

      return {
        params: {
          type: "gate",
          title: trimmedTitle,
          description: trimmedDescription,
          destinationUrl: trimmedDestinationUrl,
          priceUsdc: parseOptionalNumber(gatePriceUsdc),
          accessExpiryType,
        },
        errorMessage: null,
      }
    }

    case "document": {
      if (!documentUpload) {
        return {
          params: null,
          errorMessage: "Upload a document before creating this link.",
        }
      }

      return {
        params: {
          type: "document",
          title: trimmedTitle,
          description: trimmedDescription,
          documentR2Key: documentUpload.r2Key,
          documentPageCount: documentUpload.pageCount,
          documentFileSizeBytes: documentUpload.fileSizeBytes,
          priceUsdc: parseOptionalNumber(documentPriceUsdc),
          accessExpiryType,
        },
        errorMessage: null,
      }
    }

    case "pack": {
      if (!selectedPackFiles.length) {
        return {
          params: null,
          errorMessage:
            "Upload at least one pack file before creating this link.",
        }
      }

      if (!finalizedPackSizeBytes) {
        return {
          params: null,
          errorMessage: "Pack upload is not finalized yet. Please try again.",
        }
      }

      if (!finalizedPackR2Key) {
        return {
          params: null,
          errorMessage: "Pack upload key is missing. Please retry upload.",
        }
      }

      return {
        params: {
          type: "pack",
          title: trimmedTitle,
          description: trimmedDescription,
          documentR2Key: finalizedPackR2Key,
          packFileCount: selectedPackFiles.length,
          packTotalSizeBytes: finalizedPackSizeBytes,
          packFiles: finalizedPackFiles,
          priceUsdc: parseOptionalNumber(packPriceUsdc),
          accessExpiryType,
        },
        errorMessage: null,
      }
    }
  }
}

export default function CreateLinkPage() {
  const [mode, setMode] = useState<LinkMode>("gate")
  const { mutateAsync: createLink, isPending } = useCreateLink()
  const [title, setTitle] = useState("")
  const [documentUploadPending, setDocumentUploadPending] = useState(false)
  const [description, setDescription] = useState("")
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState("")
  const [destinationUrl, setDestinationUrl] = useState<string | undefined>(undefined)
  const [gatePriceUsdc, setGatePriceUsdc] = useState("")
  const [documentPriceUsdc, setDocumentPriceUsdc] = useState("")
  const [packPriceUsdc, setPackPriceUsdc] = useState("")
  const [tipSuggestedAmountUsdc, setTipSuggestedAmountUsdc] = useState("")
  const [documentUpload, setDocumentUpload] = useState<UploadedDoc | null>(null)
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(
    null
  )
  const [selectedPackFiles, setSelectedPackFiles] = useState<
    SelectedPackFile[]
  >([])
  const [finalizedPackSizeBytes, setFinalizedPackSizeBytes] = useState<
    number | undefined
  >(undefined)
  const [finalizedPackR2Key, setFinalizedPackR2Key] = useState<
    string | undefined
  >(undefined)
  const [finalizedPackFiles, setFinalizedPackFiles] = useState<
    PackFileCreateInput[] | undefined
  >(undefined)
  const [uploadError, setUploadError] = useState("")
  const [tipMessage, setTipMessage] = useState("Thank you for your support! 🙏")
  const [accessExpiryType, setAccessExpiryType] = useState("Forever")

  const activePriceUsdc = useMemo(() => {
    if (mode === "tip") return tipSuggestedAmountUsdc
    if (mode === "pack") return packPriceUsdc
    if (mode === "document") return documentPriceUsdc
    return gatePriceUsdc
  }, [
    documentPriceUsdc,
    gatePriceUsdc,
    mode,
    packPriceUsdc,
    tipSuggestedAmountUsdc,
  ])

  const packSummary = useMemo(() => {
    const totalBytes = selectedPackFiles.reduce(
      (sum, file) => sum + file.file.size,
      0
    )
    const counts = selectedPackFiles.reduce<Record<string, number>>(
      (acc, file) => {
        acc[file.fileType] = (acc[file.fileType] ?? 0) + 1
        return acc
      },
      {}
    )

    const breakdown = Object.entries(counts)
      .map(([kind, count]) => `${count} ${kind}`)
      .filter(Boolean)
      .join(" • ")

    return {
      totalBytes,
      breakdown: breakdown || "No files added",
    }
  }, [selectedPackFiles])

  const onDocumentFileSelect = (file: File | null) => {
    if (file) {
      const validationError = validateSingleUpload(file)
      if (validationError) {
        toast.error(validationError)
        setUploadError(validationError)
        return
      }
    }

    setSelectedDocumentFile(file)
    setDocumentUpload(null)
    setUploadError("")

    if (file && !title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const onPackFilesSelect = (files: FileList | null) => {
    const picked = Array.from(files ?? [])
    const validationError = validatePackSelection(picked)
    if (validationError) {
      toast.error(validationError)
      setUploadError(validationError)
      return
    }

    const mapped = picked.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      file,
      fileType: classifyFileByExtension(file.name),
    }))

    setSelectedPackFiles(mapped)
    setFinalizedPackSizeBytes(undefined)
    setFinalizedPackR2Key(undefined)
    setFinalizedPackFiles(undefined)
    setUploadError("")

    if (mapped.length && !title.trim()) {
      setTitle(mapped[0].file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const canCreateLink = useMemo(() => {
    if (isPending || !title.trim()) return false
    if (mode !== "tip" && !thumbnailDataUrl) return false
    if (mode === "document") return Boolean(selectedDocumentFile)
    if (mode === "pack") return selectedPackFiles.length > 0
    if (mode === "gate") return Boolean(destinationUrl?.trim())
    return true
  }, [
    destinationUrl,
    isPending,
    mode,
    selectedDocumentFile,
    selectedPackFiles.length,
    thumbnailDataUrl,
    title,
  ])

  async function handleCreateLink() {
    if (isPending) return
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      setUploadError("You need to be logged in to create links.")
      return
    }

    let finalizedDocumentUpload = documentUpload
    let finalizedPackBytes = finalizedPackSizeBytes
    let finalizedPackKey = finalizedPackR2Key
    let finalizedFiles = finalizedPackFiles

    try {
      setDocumentUploadPending(true)
      if (mode === "document") {
        if (!selectedDocumentFile) {
          setUploadError("Please choose a document file.")
          return
        }

        const finalized = await uploadDocumentAndFinalize({
          creatorId: user.id,
          file: selectedDocumentFile,
        })

        finalizedDocumentUpload = {
          r2Key: finalized.r2Key,
          pageCount: finalized.pageCount,
          fileSizeBytes: finalized.fileSizeBytes,
          filename: finalized.filename,
        }
      }

      if (mode === "pack") {
        if (!selectedPackFiles.length) {
          setUploadError("Please add at least one file to your pack.")
          return
        }

        const finalized = await uploadPackAndFinalize({
          creatorId: user.id,
          title,
          files: selectedPackFiles.map((entry) => entry.file),
        })

        finalizedPackBytes = finalized.fileSizeBytes
        finalizedPackKey = finalized.r2Key
        finalizedFiles = finalized.files
        setFinalizedPackSizeBytes(finalized.fileSizeBytes)
        setFinalizedPackR2Key(finalized.r2Key)
        setFinalizedPackFiles(finalized.files)
      }
    } catch (error) {
      setDocumentUploadPending(false)
      toast.error(
        getUploadErrorMessage(error) || "Upload failed. Please try again."
      )
      setUploadError(getUploadErrorMessage(error))
      return
    } finally {
      setDocumentUploadPending(false)
    }

    const { params, errorMessage } = buildCreateLinkParams({
      mode,
      title,
      description,
      thumbnailDataUrl,
      destinationUrl: destinationUrl ? destinationUrl : "",
      gatePriceUsdc,
      documentPriceUsdc,
      packPriceUsdc,
      tipSuggestedAmountUsdc,
      tipMessage,
      accessExpiryType,
      documentUpload: finalizedDocumentUpload,
      selectedPackFiles,
      finalizedPackSizeBytes: finalizedPackBytes,
      finalizedPackR2Key: finalizedPackKey,
      finalizedPackFiles: finalizedFiles,
    })

    if (!params) {
      if (errorMessage) {
        setUploadError(errorMessage)
      }
      return
    }

    setUploadError("")
    params.thumbnailUrl = thumbnailDataUrl
    await createLink(params)
  }

  function handleThumbnailChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setThumbnailDataUrl(objectUrl)
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
                : "border-border hover:bg-foreground/5"
            }`}
            onClick={() => setMode(card.mode)}
          >
            <CardHeader className="space-y-1">
              <CardTitle className="flex gap-1 font-heading text-lg">
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
                    value={destinationUrl}
                    onChange={(event) => setDestinationUrl(event.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price-gate">Price (USDC)</Label>
                    <Input
                      id="price-gate"
                      placeholder="12.00"
                      value={gatePriceUsdc}
                      onChange={(event) => setGatePriceUsdc(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-gate">Thumbnail</Label>
                    <Input
                      id="thumbnail-gate"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expiry-gate">Access expiry</Label>
                    <select
                      id="expiry-gate"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={accessExpiryType}
                      onChange={(event) =>
                        setAccessExpiryType(event.target.value)
                      }
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
                    <Input
                      type="file"
                    accept={acceptedUploadTypes}
                    onChange={(event) =>
                      onDocumentFileSelect(event.target.files?.[0] ?? null)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    PDF, Office, CSV, image, or video. Max 50MB.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price-document">Price (USDC)</Label>
                    <Input
                      id="price-document"
                      placeholder="12.00"
                      value={documentPriceUsdc}
                      onChange={(event) =>
                        setDocumentPriceUsdc(event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-document">Thumbnail</Label>
                    <Input
                      id="thumbnail-document"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </div>
                </div>

                {documentUpload ? (
                  <div className="flex items-center gap-3 rounded-xl border p-3 text-xs text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">
                        {documentUpload.filename}
                      </p>
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
                  <Input
                    type="file"
                    multiple
                    accept={acceptedUploadTypes}
                    onChange={(event) => onPackFilesSelect(event.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Up to 3 files, 150MB total. PDF, Office, CSV, image, and
                    video are supported.
                  </p>
                  {selectedPackFiles.length > 0 ? (
                    <div className="rounded-xl border p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {selectedPackFiles.length} files selected
                      </p>
                      <ul className="mt-2 space-y-1">
                        {selectedPackFiles.map((entry) => (
                          <li key={entry.id}>
                            {entry.file.name} - {formatBytes(entry.file.size)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price-pack">Price (USDC)</Label>
                    <Input
                      id="price-pack"
                      placeholder="20.00"
                      value={packPriceUsdc}
                      onChange={(event) => setPackPriceUsdc(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-pack">Thumbnail</Label>
                    <Input
                      id="thumbnail-pack"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
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
                      value={tipSuggestedAmountUsdc}
                      onChange={(event) =>
                        setTipSuggestedAmountUsdc(event.target.value)
                      }
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

            {uploadError ? (
              <p className="text-sm text-destructive">{uploadError}</p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={handleCreateLink}
                disabled={!canCreateLink || isPending || documentUploadPending}
              >
                {isPending || documentUploadPending ? (
                  <LoadingSpinner size={4} />
                ) : (
                  "Create link"
                )}
              </Button>
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
            <div
              onClick={() =>
                toast.info(
                  "Custom video and image thumbnail upload coming soon."
                )
              }
              className="group relative mb-2 cursor-pointer"
            >
              <Image
                src={thumbnailDataUrl ? thumbnailDataUrl : "/icon.png"}
                alt="Wallet"
                width={200}
                height={100}
                className="w-full rounded-2xl h-52"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/75 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <HugeiconsIcon
                  icon={Edit01FreeIcons}
                  className="size-5 text-chart-1"
                />
                <p className="mt-2 text-sm">Custom Thumbnail</p>
              </div>
            </div>
            <div className="space-y-3 rounded-xl border p-4">
              <Badge>{mode === "tip" ? "Support" : "Locked content"}</Badge>
              <p className="font-medium">
                {title.trim().length > 0 ? title : "React Native Crash Course"}
              </p>
              <p className="text-sm text-muted-foreground">
                {mode === "pack"
                  ? `${selectedPackFiles.length} files • ${packSummary.breakdown}`
                  : mode === "document"
                    ? `${documentUpload?.pageCount ?? 0} pages • secure in-browser access`
                    : mode === "tip"
                      ? "Fans can choose any amount to support your work"
                      : "Complete practical guide with project files and implementation checklist."}
              </p>
              <div className="rounded-2xl bg-muted p-3 text-sm">
                <p>
                  Price:{" "}
                  {mode === "tip"
                    ? "Custom amount"
                    : activePriceUsdc || "12.00"}{" "}
                  USDC
                </p>
                <p className="text-muted-foreground">
                  {mode === "pack"
                    ? `${formatKesFromUsdc(activePriceUsdc)} • ${formatBytes(packSummary.totalBytes)}`
                    : mode === "document"
                      ? `${formatKesFromUsdc(activePriceUsdc)} • ${formatBytes(documentUpload?.fileSizeBytes ?? 0)}`
                      : formatKesFromUsdc(activePriceUsdc)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
