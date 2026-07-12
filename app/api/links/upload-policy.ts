import {
  allowedExtensions,
  allowedMimeTypes,
  normalizeMimeType,
  SINGLE_FILE_MAX_BYTES,
} from "@/lib/links/file-policy"

export type UploadMode = "document" | "pack"

type ModePolicy = {
  prefix: string
  maxBytes: number
  allowedContentTypes: readonly string[]
  allowedExtensions: readonly string[]
}

export const uploadPolicy: Record<UploadMode, ModePolicy> = {
  document: {
    prefix: "documents",
    maxBytes: SINGLE_FILE_MAX_BYTES,
    allowedContentTypes: allowedMimeTypes,
    allowedExtensions,
  },
  pack: {
    prefix: "packs",
    maxBytes: SINGLE_FILE_MAX_BYTES,
    allowedContentTypes: allowedMimeTypes,
    allowedExtensions,
  },
}

export function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase()
}

export function normalizeContentType(contentType: string | null | undefined) {
  return normalizeMimeType(contentType)
}

export function isAllowedContentType(mode: UploadMode, contentType: string) {
  return uploadPolicy[mode].allowedContentTypes.includes(
    normalizeContentType(contentType)
  )
}

export function isAllowedExtension(mode: UploadMode, extension: string) {
  return uploadPolicy[mode].allowedExtensions.includes(extension.toLowerCase())
}

export function isWithinSizeLimit(mode: UploadMode, bytes: number) {
  return (
    Number.isFinite(bytes) && bytes > 0 && bytes <= uploadPolicy[mode].maxBytes
  )
}

export function hasExpectedPrefix(
  mode: UploadMode,
  creatorId: string,
  key: string
) {
  return key.startsWith(`${uploadPolicy[mode].prefix}/${creatorId}/`)
}
