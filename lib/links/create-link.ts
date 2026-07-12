import { createClient } from "@/lib/supabase/client"
import { getErrorMessage } from "@/lib/utils"
import type { CreateLinkParams, Link, LinkMode } from "./types"

type LinkInsert = {
  creator_id: string
  type: LinkMode
  title: string
  description: string | null
  thank_you_message: string | null
  thumbnail_url: string | null
  access_expiry_type: string | null
  access_max_views: number | null
  access_ip_binding: boolean
  access_wallet_binding: boolean
  destination_url: string | null
  document_r2_key: string | null
  document_page_count: number | null
  document_file_size_bytes: number | null
  document_thumbnail_r2_key: string | null
  pack_thumbnail_r2_key: string | null
  pack_file_count: number | null
  pack_total_size_bytes: number | null
  price_usdc: number | null
  suggested_amount_usdc: number | null
  doc_watermark_enabled: boolean
  doc_download_blocked: boolean
  moderation_status: "pending_review"
}

function baseLinkInsert(creatorId: string, params: CreateLinkParams): LinkInsert {
  return {
    creator_id: creatorId,
    type: params.type,
    title: params.title,
    description: params.description ?? null,
    thank_you_message: params.thankYouMessage ?? null,
    thumbnail_url: null,
    access_expiry_type: params.accessExpiryType ?? null,
    access_max_views: params.accessMaxViews ?? null,
    access_ip_binding: params.accessIpBinding ?? false,
    access_wallet_binding: params.accessWalletBinding ?? false,
    destination_url: null,
    document_r2_key: null,
    document_page_count: null,
    document_file_size_bytes: null,
    document_thumbnail_r2_key: null,
    pack_thumbnail_r2_key: null,
    pack_file_count: null,
    pack_total_size_bytes: null,
    price_usdc: null,
    suggested_amount_usdc: null,
    doc_watermark_enabled: false,
    doc_download_blocked: true,
    moderation_status: "pending_review",
  }
}

function typeFields(params: CreateLinkParams): Partial<LinkInsert> {
  if (params.type === "tip") {
    return {
      price_usdc: params.priceUsdc ?? null,
      suggested_amount_usdc: params.suggestedAmountUsdc ?? null,
    }
  }
  if (params.type === "gate") {
    return {
      destination_url: params.destinationUrl,
      price_usdc: params.priceUsdc ?? null,
      suggested_amount_usdc: params.suggestedAmountUsdc ?? null,
    }
  }
  if (params.type === "document") {
    return {
      destination_url: params.destinationUrl ?? null,
      document_r2_key: params.documentR2Key,
      document_page_count: params.documentPageCount,
      document_file_size_bytes: params.documentFileSizeBytes,
      document_thumbnail_r2_key: params.documentThumbnailR2Key ?? null,
      price_usdc: params.priceUsdc ?? null,
      doc_watermark_enabled: params.docWatermarkEnabled ?? false,
      doc_download_blocked: params.docDownloadBlocked ?? true,
    }
  }
  return {
    document_r2_key: params.documentR2Key,
    pack_thumbnail_r2_key: params.packThumbnailR2Key ?? null,
    pack_file_count: params.packFileCount,
    pack_total_size_bytes: params.packTotalSizeBytes,
    price_usdc: params.priceUsdc ?? null,
    doc_download_blocked: params.docDownloadBlocked ?? true,
  }
}

async function uploadThumbnail(creatorId: string, dataUrl?: string) {
  if (!dataUrl) return null
  const supabase = createClient()
  const blob = await fetch(dataUrl).then((res) => res.blob())
  const fileName = `${Date.now()}.png`
  const { data } = await supabase.storage
    .from("xpesa-public")
    .upload(`thumbnails/${creatorId}/${fileName}`, blob, { cacheControl: "3600" })
  return data?.fullPath ?? null
}

export async function createLink(creatorId: string, params: CreateLinkParams) {
  try {
    const supabase = createClient()
    const thumbnail = await uploadThumbnail(creatorId, params.thumbnailUrl)
    const insert = {
      ...baseLinkInsert(creatorId, params),
      ...typeFields(params),
      thumbnail_url: thumbnail,
    }
    const { data, error } = await supabase
      .from("links")
      .insert(insert)
      .select()
      .single()

    return { data: data as Link | null, error }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(getErrorMessage(error)),
    }
  }
}
