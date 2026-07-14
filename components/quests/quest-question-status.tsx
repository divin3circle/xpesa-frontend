"use client"

export function QuestQuestionStatus({
  current,
  total,
  locked,
}: {
  current: number
  total: number
  locked: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold text-muted-foreground">
        Question {current + 1} of {total}
      </p>
      {locked && (
        <span className="rounded-full border bg-foreground/5 px-3 py-1 text-xs">
          Answers locked
        </span>
      )}
    </div>
  )
}
