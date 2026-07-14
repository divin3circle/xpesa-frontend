"use client"

import type { QuestReviewAttempt } from "@/hooks/use-quest-review"

export function QuestReviewStats({
  attempts,
}: {
  attempts: QuestReviewAttempt[]
}) {
  const rejected = attempts.reduce(
    (sum, attempt) =>
      sum +
      (attempt.score_result?.reviews?.filter(
        (item) => item.status === "rejected"
      ).length ?? 0),
    0
  )
  const average = attempts.length
    ? attempts.reduce((sum, item) => sum + Number(item.score ?? 0), 0) /
      attempts.length
    : 0
  const stats = [
    ["Submissions", attempts.length, "Submitted attempts"],
    ["Average score", average.toFixed(1), "After review"],
    ["Rejected answers", rejected, "Manual review actions"],
  ]

  return (
    <section className="grid gap-3 md:grid-cols-3">
      {stats.map(([label, value, detail]) => (
        <div key={label} className="rounded-2xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      ))}
    </section>
  )
}
