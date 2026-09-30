"use client"

import { ChangeEvent, useMemo, useState } from "react"

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
import { useCreateLink } from "@/hooks/use-links"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { createClient } from "@/lib/supabase/client"
import {
  getUploadErrorMessage,
  uploadDocumentAndFinalize,
  uploadPackAndFinalize,
} from "@/lib/links/upload-client"
import {
  classifyFileByExtension,
  validatePackSelection,
  validateSingleUpload,
} from "@/lib/links/file-policy"
import type { PackFileCreateInput } from "@/lib/links/types"
import { toast } from "sonner"

import { DocumentFields } from "./_components/document-fields"
import { FanPreview } from "./_components/fan-preview"
import { GateFields } from "./_components/gate-fields"
import { ModeCards } from "./_components/mode-cards"
import { PackFields } from "./_components/pack-fields"
import { TipFields } from "./_components/tip-fields"
import { buildCreateLinkParams } from "./_components/helpers"
import type {
  LinkMode,
  SelectedPackFile,
  UploadedDoc,
} from "./_components/types"

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

      <ModeCards mode={mode} setMode={setMode} />

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
              <GateFields
                destinationUrl={destinationUrl}
                setDestinationUrl={setDestinationUrl}
                gatePriceUsdc={gatePriceUsdc}
                setGatePriceUsdc={setGatePriceUsdc}
                accessExpiryType={accessExpiryType}
                setAccessExpiryType={setAccessExpiryType}
                handleThumbnailChange={handleThumbnailChange}
              />
            ) : null}

            {mode === "document" ? (
              <DocumentFields
                onDocumentFileSelect={onDocumentFileSelect}
                documentPriceUsdc={documentPriceUsdc}
                setDocumentPriceUsdc={setDocumentPriceUsdc}
                documentUpload={documentUpload}
                handleThumbnailChange={handleThumbnailChange}
              />
            ) : null}

            {mode === "pack" ? (
              <PackFields
                onPackFilesSelect={onPackFilesSelect}
                selectedPackFiles={selectedPackFiles}
                packPriceUsdc={packPriceUsdc}
                setPackPriceUsdc={setPackPriceUsdc}
                handleThumbnailChange={handleThumbnailChange}
              />
            ) : null}

            {mode === "tip" ? (
              <TipFields
                tipSuggestedAmountUsdc={tipSuggestedAmountUsdc}
                setTipSuggestedAmountUsdc={setTipSuggestedAmountUsdc}
                tipMessage={tipMessage}
                setTipMessage={setTipMessage}
              />
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

        <FanPreview
          mode={mode}
          title={title}
          thumbnailDataUrl={thumbnailDataUrl}
          activePriceUsdc={activePriceUsdc}
          selectedPackFiles={selectedPackFiles}
          packSummary={packSummary}
          documentUpload={documentUpload}
        />
      </section>
    </div>
  )
}
