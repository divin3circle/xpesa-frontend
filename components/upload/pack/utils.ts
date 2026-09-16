export type PackFileState = {
  packFileId: string | null
  originalFilename: string
  fileType: "pdf" | "image"
  fileSizeBytes: number
  pageCount?: number
  imageWidth?: number
  imageHeight?: number
  sortOrder: number
  status: "uploading" | "converting" | "ready" | "error"
  progress: number
  error?: string
  localId?: string
}

export const MAX_PACK_FILES = 3
export const MAX_PDF_BYTES = 50 * 1024 * 1024
export const MAX_DOCX_BYTES = 20 * 1024 * 1024
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? ""
}

export function toMbLabel(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validatePackFile(file: File) {
  const extension = getExtension(file.name)
  const imageExtensions = ["png", "jpg", "jpeg", "webp"]

  if (!["pdf", "docx", ...imageExtensions].includes(extension)) {
    return "Unsupported file type."
  }

  if (extension === "pdf" && file.size > MAX_PDF_BYTES) {
    return "PDF exceeds 50MB limit."
  }

  if (extension === "docx" && file.size > MAX_DOCX_BYTES) {
    return "DOCX exceeds 20MB limit."
  }

  if (imageExtensions.includes(extension) && file.size > MAX_IMAGE_BYTES) {
    return "Image exceeds 10MB limit."
  }

  return null
}

export function normalizeSort(files: PackFileState[]) {
  return files.map((file, index) => ({ ...file, sortOrder: index }))
}

export function getPackFileId(file: PackFileState) {
  return (
    file.localId ??
    file.packFileId ??
    `${file.originalFilename}-${file.sortOrder}`
  )
}
