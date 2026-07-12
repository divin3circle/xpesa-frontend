export type SupportedFileKind =
  | "pdf"
  | "image"
  | "video"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "csv"
  | "file"

export const MB = 1024 * 1024
export const SINGLE_FILE_MAX_BYTES = 50 * MB
export const PACK_MAX_FILES = 3
export const PACK_MAX_TOTAL_BYTES = 150 * MB

export const allowedFileTypes = {
  pdf: {
    extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
  },
  document: {
    extensions: ["docx"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  presentation: {
    extensions: ["ppt", "pptx"],
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
  spreadsheet: {
    extensions: ["xls", "xlsx"],
    mimeTypes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  csv: {
    extensions: ["csv"],
    mimeTypes: ["text/csv", "application/csv", "application/vnd.ms-excel"],
  },
  image: {
    extensions: ["png", "jpg", "jpeg", "webp", "gif"],
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  },
  video: {
    extensions: ["mp4", "webm", "mov"],
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
  },
} as const

export const allowedExtensions = Object.values(allowedFileTypes).flatMap(
  (type) => [...type.extensions]
) as string[]

export const allowedMimeTypes = Object.values(allowedFileTypes).flatMap(
  (type) => [...type.mimeTypes]
) as string[]

export const acceptedUploadTypes = [
  ...allowedExtensions.map((extension) => `.${extension}`),
  ...allowedMimeTypes,
].join(",")

export function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

export function normalizeMimeType(contentType: string | null | undefined) {
  return contentType?.split(";")[0]?.trim().toLowerCase() ?? ""
}

export function classifyFileByExtension(fileName: string): SupportedFileKind {
  const extension = getFileExtension(fileName)

  if (extension === "pdf") return "pdf"
  if (allowedFileTypes.image.extensions.includes(extension as never)) {
    return "image"
  }
  if (allowedFileTypes.video.extensions.includes(extension as never)) {
    return "video"
  }
  if (allowedFileTypes.document.extensions.includes(extension as never)) {
    return "document"
  }
  if (allowedFileTypes.presentation.extensions.includes(extension as never)) {
    return "presentation"
  }
  if (allowedFileTypes.spreadsheet.extensions.includes(extension as never)) {
    return "spreadsheet"
  }
  if (extension === "csv") return "csv"

  return "file"
}

export function resolveMimeType(fileName: string, providedType?: string) {
  const normalized = normalizeMimeType(providedType)
  if (normalized && allowedMimeTypes.includes(normalized)) return normalized

  const extension = getFileExtension(fileName)
  for (const type of Object.values(allowedFileTypes)) {
    const index = type.extensions.indexOf(extension as never)
    if (index >= 0) return type.mimeTypes[Math.min(index, type.mimeTypes.length - 1)]
  }

  return "application/octet-stream"
}

export function isAllowedExtension(extension: string) {
  return allowedExtensions.includes(extension.toLowerCase())
}

export function isAllowedMimeType(contentType: string) {
  return allowedMimeTypes.includes(normalizeMimeType(contentType))
}

export function validateSingleUpload(file: { name: string; size: number }) {
  if (!isAllowedExtension(getFileExtension(file.name))) {
    return "Unsupported file type."
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return "File is empty or invalid."
  }

  if (file.size > SINGLE_FILE_MAX_BYTES) {
    return "File exceeds the 50MB upload limit."
  }

  return null
}

export function validatePackSelection(files: Array<{ name: string; size: number }>) {
  if (files.length > PACK_MAX_FILES) return "Packs can contain up to 3 files."

  const invalidFile = files.find((file) => validateSingleUpload(file))
  if (invalidFile) return validateSingleUpload(invalidFile)

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  if (totalBytes > PACK_MAX_TOTAL_BYTES) {
    return "Pack exceeds the 150MB total upload limit."
  }

  return null
}
