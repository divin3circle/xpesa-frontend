import { resolveMimeType } from "@/lib/links/file-policy"
import { validateAnswerFile, type QuestAnswerFile } from "@/lib/quests/answer-files"

/**
 * Upload a single quest answer file via the public presign → PUT → finalize flow.
 * Returns the stored file descriptor to persist in the attempt's answer.
 */
export async function uploadQuestAnswerFile(params: {
  questId: string
  attemptId: string
  file: File
}): Promise<QuestAnswerFile> {
  const validationError = validateAnswerFile(params.file)
  if (validationError) throw new Error(validationError)

  const contentType = resolveMimeType(params.file.name, params.file.type)

  const signRes = await fetch(
    `/api/public/quests/${params.questId}/answer-upload-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: params.attemptId,
        fileName: params.file.name,
        fileType: contentType,
        fileSizeBytes: params.file.size,
      }),
    }
  )
  const sign = await signRes.json().catch(() => ({}))
  if (!signRes.ok) throw new Error(sign.error || "Could not start upload")

  const putRes = await fetch(sign.uploadUrl, {
    method: "PUT",
    body: params.file,
    headers: { "Content-Type": sign.contentType },
  })
  if (!putRes.ok) throw new Error("Upload failed. Please retry.")

  const finRes = await fetch(
    `/api/public/quests/${params.questId}/answer-upload-finalize`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: params.attemptId,
        key: sign.key,
        name: params.file.name,
      }),
    }
  )
  const fin = await finRes.json().catch(() => ({}))
  if (!finRes.ok) throw new Error(fin.error || "Could not finalize upload")

  return {
    key: String(fin.key),
    name: String(fin.name),
    size: Number(fin.size ?? 0),
    type: String(fin.type ?? contentType),
  }
}
