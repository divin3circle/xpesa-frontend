import {
  allowedFileTypes,
  getFileExtension,
  normalizeMimeType,
  MB,
} from "@/lib/links/file-policy"

export const ANSWER_MAX_BYTES = 10 * MB
export const ANSWER_MAX_FILES = 3

// Quest file answers allow images + documents (no video).
const ANSWER_KINDS = [
  "image",
  "pdf",
  "document",
  "presentation",
  "spreadsheet",
  "csv",
] as const

export const answerAllowedExtensions = ANSWER_KINDS.flatMap(
  (k) => [...allowedFileTypes[k].extensions]
) as string[]

export const answerAllowedMimeTypes = ANSWER_KINDS.flatMap(
  (k) => [...allowedFileTypes[k].mimeTypes]
) as string[]

export const answerAcceptAttr = [
  ...answerAllowedExtensions.map((e) => `.${e}`),
  ...answerAllowedMimeTypes,
].join(",")

export function isAnswerExtensionAllowed(ext: string) {
  return answerAllowedExtensions.includes(ext.toLowerCase())
}

export function isAnswerMimeAllowed(mime: string) {
  return answerAllowedMimeTypes.includes(normalizeMimeType(mime))
}

export type QuestAnswerFile = {
  key: string
  name: string
  size: number
  type: string
}

/** Safely parse a file-answer string (JSON array of file descriptors). */
export function parseAnswerFiles(
  answer: string | null | undefined
): QuestAnswerFile[] {
  if (!answer) return []
  try {
    const parsed = JSON.parse(answer)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((f) => f && typeof f.key === "string")
      .slice(0, ANSWER_MAX_FILES)
      .map((f) => ({
        key: String(f.key),
        name: String(f.name ?? "file"),
        size: Number(f.size ?? 0),
        type: String(f.type ?? ""),
      }))
  } catch {
    return []
  }
}

export function validateAnswerFile(file: {
  name: string
  size: number
}): string | null {
  if (!isAnswerExtensionAllowed(getFileExtension(file.name))) {
    return "Unsupported file type."
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return "File is empty or invalid."
  }
  if (file.size > ANSWER_MAX_BYTES) {
    return "File exceeds the 10MB limit."
  }
  return null
}

export function isImageFile(file: QuestAnswerFile) {
  return (
    file.type.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif"].includes(getFileExtension(file.name))
  )
}
