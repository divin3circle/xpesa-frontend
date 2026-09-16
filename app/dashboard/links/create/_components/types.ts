import type { SupportedFileKind } from "@/lib/links/file-policy"
import type { PackFileCreateInput } from "@/lib/links/types"

export type UploadedDoc = {
  r2Key: string
  pageCount: number | null
  fileSizeBytes: number
  filename: string
  fileType?: SupportedFileKind
}

export type SelectedPackFile = {
  id: string
  file: File
  fileType: SupportedFileKind
}

export type LinkMode = "gate" | "document" | "pack" | "tip"

export type LinkFormValues = {
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
