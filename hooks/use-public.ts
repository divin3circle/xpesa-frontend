import { useQuery } from "@tanstack/react-query"
import type {
  GetPublicLinkResponse,
  PublicLinkErrorResponse,
} from "@/app/api/public/links/route"
import type {
  GetCreatorResponse,
  ErrorResponse,
} from "@/app/api/public/creator/[handle]/route"
import type {
  CreatorHandleByIdErrorResponse,
  GetCreatorHandleByIdResponse,
} from "@/app/api/public/creator-id/[id]/route"

async function getPublicCreator(handle: string): Promise<GetCreatorResponse> {
  if (!handle || handle.trim().length === 0) {
    throw new Error("Creator handle is required")
  }

  const response = await fetch(
    `/api/public/creator/${encodeURIComponent(handle)}`
  )

  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error || "Failed to fetch creator")
  }

  return await response.json()
}

export function usePublicCreator(handle: string | null | undefined) {
  return useQuery({
    queryKey: ["public-creator", handle],
    queryFn: () => getPublicCreator(handle!),
    enabled: !!handle && handle.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

async function getPublicCreatorHandleById(
  creatorId: string
): Promise<GetCreatorHandleByIdResponse> {
  if (!creatorId || creatorId.trim().length === 0) {
    throw new Error("Creator id is required")
  }

  const response = await fetch(
    `/api/public/creator-id/${encodeURIComponent(creatorId)}`
  )

  if (!response.ok) {
    const error: CreatorHandleByIdErrorResponse = await response.json()
    throw new Error(error.error || "Failed to fetch creator handle")
  }

  return await response.json()
}

export function usePublicCreatorHandleById(
  creatorId: string | null | undefined
) {
  return useQuery({
    queryKey: ["public-creator-handle", creatorId],
    queryFn: () => getPublicCreatorHandleById(creatorId!),
    enabled: !!creatorId && creatorId.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

async function getPublicLink(linkId: string): Promise<GetPublicLinkResponse> {
  if (!linkId || linkId.trim().length === 0) {
    throw new Error("Link id is required")
  }

  const response = await fetch(
    `/api/public/links?id=${encodeURIComponent(linkId)}`
  )

  if (!response.ok) {
    const error: PublicLinkErrorResponse = await response.json()
    throw new Error(error.error || "Failed to fetch link details")
  }

  return response.json()
}

export function usePublicLink(linkId: string | null | undefined) {
  return useQuery({
    queryKey: ["public-link", linkId],
    queryFn: () => getPublicLink(linkId!),
    enabled: !!linkId && linkId.trim().length > 0,
    staleTime: 1000 * 60 * 3,
  })
}
