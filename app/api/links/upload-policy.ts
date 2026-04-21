export type UploadMode = "document" | "pack"

type ModePolicy = {
  prefix: string
  maxBytes: number
  allowedContentTypes: readonly string[]
  allowedExtensions: readonly string[]
}

const MB = 1024 * 1024

export const uploadPolicy: Record<UploadMode, ModePolicy> = {
  document: {
    prefix: "documents",
    maxBytes: 50 * MB,
    allowedContentTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: ["pdf", "docx"],
  },
  pack: {
    prefix: "packs",
    maxBytes: 150 * MB,
    allowedContentTypes: ["application/zip"],
    allowedExtensions: ["zip"],
  },
}

export function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase()
}

export function normalizeContentType(contentType: string | null | undefined) {
  return contentType?.split(";")[0]?.trim().toLowerCase() ?? ""
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
