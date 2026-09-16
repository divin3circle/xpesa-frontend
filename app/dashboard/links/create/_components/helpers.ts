import type { CreateLinkParams } from "@/hooks/use-links"

import type { LinkFormValues } from "./types"

export function formatBytes(bytes: number) {
  if (!bytes) return "0 KB"
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return undefined

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const KES_PER_USDC = 129

export function formatKesFromUsdc(value: string) {
  const amount = parseOptionalNumber(value)
  if (!amount || amount <= 0) return "KES 0"

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount * KES_PER_USDC)
}

export function buildCreateLinkParams({
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
