"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { QuestReviewAttempt } from "@/hooks/use-quest-review"
import { shortWallet } from "./quest-review-utils"

export function QuestSubmissionsTable({
  attempts,
  onSelect,
}: {
  attempts: QuestReviewAttempt[]
  onSelect: (attempt: QuestReviewAttempt) => void
}) {
  if (!attempts.length) {
    return (
      <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
        No submissions yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Participant</th>
            <th className="px-4 py-3 font-medium">Wallet</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 text-right font-medium">Review</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {attempts.map((attempt) => (
            <tr key={attempt.id}>
              <td className="px-4 py-3 font-medium">
                {attempt.participant?.display_name ?? "Player"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {shortWallet(attempt.participant?.wallet_address ?? "")}
              </td>
              <td className="px-4 py-3">
                <Badge variant="secondary">
                  {attempt.score ?? 0}/{attempt.max_score ?? 0}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(attempt.submitted_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelect(attempt)}
                >
                  Open
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
