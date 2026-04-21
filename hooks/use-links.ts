import { createClient } from "@/lib/supabase/client"
import { TABLENAMES } from "@/lib/supabase/utilities"
import { getErrorMessage } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface Link {
  id: string
  created_at: Date | string
  updated_at: Date | string | null
  creator_id: string
  is_active: boolean
  type: string
  title: string
  description: string | null
  destination_url: string | null
  thumbnail_url: string | null
  document_r2_key: string | null
  document_page_count: number | null
  document_file_size_bytes: number | null
  document_thumbnail_r2_key: string | null
  pack_thumbnail_r2_key: string | null
  pack_file_count: number | null
  pack_total_size_bytes: number | null
  price_usdc: number | null
  suggested_amount_usdc: number | null
  total_earned_usdc: number
  access_expiry_type: string | null
  access_max_views: number | null
  access_ip_binding: boolean
  access_wallet_binding: boolean
  doc_watermark_enabled: boolean
  doc_download_blocked: boolean
  thank_you_message: string | null
  view_count: number
  payment_count: number
}

export interface LinkResponse {
  links: Link[]
  error: Error | string | null
}

type LinkMode = "gate" | "document" | "pack" | "tip"

interface BaseLinkParams {
  title: string
  description?: string
  thankYouMessage?: string
  thumbnailUrl?: string
  accessExpiryType?: string
  accessMaxViews?: number
  accessIpBinding?: boolean
  accessWalletBinding?: boolean
}

type TipLinkParams = BaseLinkParams & {
  type: "tip"
  priceUsdc?: number
  suggestedAmountUsdc?: number
}

type DocumentLinkParams = BaseLinkParams & {
  type: "document"
  destinationUrl?: string
  documentR2Key: string
  documentPageCount: number | null
  documentFileSizeBytes: number
  documentThumbnailR2Key?: string
  priceUsdc?: number
  docWatermarkEnabled?: boolean
  docDownloadBlocked?: boolean
}

type PackLinkParams = BaseLinkParams & {
  type: "pack"
  documentR2Key: string
  packThumbnailR2Key?: string
  packFileCount: number
  packTotalSizeBytes: number
  priceUsdc?: number
  docDownloadBlocked?: boolean
}

type GatedLinkParams = BaseLinkParams & {
  type: "gate"
  destinationUrl: string
  priceUsdc?: number
  suggestedAmountUsdc?: number
}

export type CreateLinkParams =
  | TipLinkParams
  | DocumentLinkParams
  | PackLinkParams
  | GatedLinkParams

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
}

async function createLink(
  creatorId: string,
  params: CreateLinkParams
): Promise<{ data: Link | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const baseInsert: LinkInsert = {
      creator_id: creatorId,
      type: params.type,
      title: params.title,
      description: params.description ?? null,
      thank_you_message: params.thankYouMessage ?? null,
      thumbnail_url: params.thumbnailUrl ?? null,
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
    }

    let typeInsert: Partial<LinkInsert> = {}

    switch (params.type) {
      case "tip":
        typeInsert = {
          price_usdc: params.priceUsdc ?? null,
          suggested_amount_usdc: params.suggestedAmountUsdc ?? null,
        }
        break

      case "document":
        typeInsert = {
          destination_url: params.destinationUrl ?? null,
          document_r2_key: params.documentR2Key,
          document_page_count: params.documentPageCount,
          document_file_size_bytes: params.documentFileSizeBytes,
          document_thumbnail_r2_key: params.documentThumbnailR2Key ?? null,
          price_usdc: params.priceUsdc ?? null,
          doc_watermark_enabled: params.docWatermarkEnabled ?? false,
          doc_download_blocked: params.docDownloadBlocked ?? true,
        }
        break

      case "pack":
        typeInsert = {
          document_r2_key: params.documentR2Key,
          pack_thumbnail_r2_key: params.packThumbnailR2Key ?? null,
          pack_file_count: params.packFileCount,
          pack_total_size_bytes: params.packTotalSizeBytes,
          price_usdc: params.priceUsdc ?? null,
          doc_download_blocked: params.docDownloadBlocked ?? true,
        }
        break

      case "gate":
        typeInsert = {
          destination_url: params.destinationUrl,
          price_usdc: params.priceUsdc ?? null,
          suggested_amount_usdc: params.suggestedAmountUsdc ?? null,
        }
        break
    }

    const { data, error } = await supabase
      .from("links")
      .insert({ ...baseInsert, ...typeInsert })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    toast.error(getErrorMessage(error) || "Failed to create link")
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error("An unknown error occurred"),
    }
  }
}

async function getCreatorLinks(): Promise<LinkResponse> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        links: [],
        error: Error("User is not authenticated"),
      }
    }

    const { data, error } = await supabase
      .from(TABLENAMES.LINKS)
      .select("*")
      .eq("creator_id", user.id)

    if (error || !data) {
      console.log("Error fetching links: ", error)
      return {
        links: [],
        error: error || Error("User links could not be loaded"),
      }
    }

    return {
      links: data,
      error: null,
    }
  } catch (error) {
    console.log("Error fetching links: ", error)
    return {
      links: [],
      error: getErrorMessage(error),
    }
  }
}

export function useMyLinks() {
  return useQuery({
    queryKey: ["links"],
    queryFn: getCreatorLinks,
  })
}

export function useCreateLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: CreateLinkParams) => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User is not authenticated")
      }

      const { data, error } = await createLink(user.id, params)

      if (error || !data) {
        console.log("Error creating link: ", error)
        throw new Error(getErrorMessage(error) || "Failed to create link")
      }

      return data
    },
    onSuccess: () => {
      toast.success("Link created successfully!")
      queryClient.invalidateQueries({ queryKey: ["links"] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to create link")
    },
  })
}
