"use client"

import { Fragment, useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { shortWallet } from "@/components/quests/quest-review-utils"
import type { QuestAnalyticsSubmission } from "@/app/api/quests/[id]/analytics/route"

type TabKey = "all" | "completed" | "partial"

export function QuestSubmissionsTabs({
  completed,
  partial,
  totalQuestions,
}: {
  completed: QuestAnalyticsSubmission[]
  partial: QuestAnalyticsSubmission[]
  totalQuestions: number
}) {
  const [tab, setTab] = useState<TabKey>("all")
  const [expanded, setExpanded] = useState<string | null>(null)

  const all = useMemo(
    () =>
      [...completed, ...partial].sort((a, b) =>
        (b.submitted_at ?? b.started_at).localeCompare(
          a.submitted_at ?? a.started_at
        )
      ),
    [completed, partial]
  )

  const rows = tab === "completed" ? completed : tab === "partial" ? partial : all

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: all.length },
    { key: "completed", label: "Completed", count: completed.length },
    { key: "partial", label: "Partial", count: partial.length },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium transition",
              tab === item.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          No submissions in this view yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Participant</th>
                <th className="px-4 py-3 font-medium">Wallet</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const isCompleted = row.status === "submitted"
                const when = isCompleted ? row.submitted_at : row.started_at
                const partialAnswers = row.answers ?? []
                const canExpand = !isCompleted && partialAnswers.length > 0
                const isOpen = expanded === row.id
                const reached =
                  typeof row.last_question_index === "number"
                    ? row.last_question_index + 1
                    : null
                return (
                  <Fragment key={row.id}>
                    <tr
                      className={cn(canExpand && "cursor-pointer hover:bg-muted/40")}
                      onClick={
                        canExpand
                          ? () => setExpanded(isOpen ? null : row.id)
                          : undefined
                      }
                    >
                      <td className="px-4 py-3 font-medium">
                        <span className="flex items-center gap-1.5">
                          {canExpand ? (
                            isOpen ? (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="size-4 text-muted-foreground" />
                            )
                          ) : null}
                          {row.display_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {shortWallet(row.wallet_address)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          {row.score}/{row.max_score}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {isCompleted ? (
                          <Badge variant="default">Completed</Badge>
                        ) : (
                          <Badge variant="outline">
                            {reached && totalQuestions
                              ? `Reached Q${reached}/${totalQuestions}`
                              : "In progress"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {when ? new Date(when).toLocaleString() : "—"}
                      </td>
                    </tr>
                    {canExpand && isOpen ? (
                      <tr>
                        <td colSpan={5} className="bg-muted/20 px-4 py-3">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Answers so far
                          </p>
                          <div className="space-y-2">
                            {partialAnswers.map((a, index) => (
                              <div
                                key={index}
                                className="rounded-xl border border-border/60 bg-background px-3 py-2"
                              >
                                <p className="text-xs text-muted-foreground">
                                  {a.prompt}
                                </p>
                                <p className="text-sm">{a.answer}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
