"use client"

import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { FileText, ImageIcon, Loader2, Paperclip, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadQuestAnswerFile } from "@/lib/quests/answer-upload-client"
import {
  ANSWER_MAX_FILES,
  answerAcceptAttr,
  isImageFile,
  parseAnswerFiles,
  type QuestAnswerFile,
} from "@/lib/quests/answer-files"

export function QuestFileAnswerInput({
  questId,
  attemptId,
  selectedAnswer,
  locked,
  onAnswer,
}: {
  questId?: string
  attemptId?: string
  selectedAnswer?: string
  locked: boolean
  onAnswer: (value: string) => void
}) {
  const files = useMemo(() => parseAnswerFiles(selectedAnswer), [selectedAnswer])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const previews = useRef<Map<string, string>>(new Map())

  const commit = (next: QuestAnswerFile[]) =>
    onAnswer(next.length ? JSON.stringify(next) : "")

  async function handleFiles(list: FileList | null) {
    if (!list || !questId || !attemptId) return
    const slots = ANSWER_MAX_FILES - files.length
    if (slots <= 0) {
      toast.error(`You can attach up to ${ANSWER_MAX_FILES} files.`)
      return
    }
    const picked = Array.from(list).slice(0, slots)
    setUploading(true)
    const added: QuestAnswerFile[] = []
    for (const file of picked) {
      try {
        const uploaded = await uploadQuestAnswerFile({ questId, attemptId, file })
        if (isImageFile(uploaded)) {
          try {
            previews.current.set(uploaded.key, URL.createObjectURL(file))
          } catch {
            // ignore preview failures
          }
        }
        added.push(uploaded)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed")
      }
    }
    if (added.length) commit([...files, ...added])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  const remove = (key: string) => commit(files.filter((f) => f.key !== key))
  const canAdd = !locked && files.length < ANSWER_MAX_FILES

  return (
    <div className="space-y-3">
      {files.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {files.map((f) => {
            const preview = previews.current.get(f.key)
            return (
              <div
                key={f.key}
                className="flex items-center gap-3 rounded-2xl border p-2"
              >
                {isImageFile(f) && preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt={f.name}
                    className="size-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">
                    {isImageFile(f) ? (
                      <ImageIcon className="size-5" />
                    ) : (
                      <FileText className="size-5" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(f.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                {!locked ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(f.key)}
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}

      {canAdd ? (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-sm text-muted-foreground transition hover:border-foreground/40 hover:bg-foreground/[0.03] disabled:opacity-60"
          )}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Paperclip className="size-4" />
          )}
          {uploading
            ? "Uploading…"
            : `Add files (${files.length}/${ANSWER_MAX_FILES}) — images or documents, 10MB each`}
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={answerAcceptAttr}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
