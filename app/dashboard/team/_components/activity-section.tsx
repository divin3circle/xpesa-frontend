"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeamActivity } from "@/hooks/use-teams"

import { ACTIVITY_LABEL, ACTIVITY_PAGE_SIZE, cardBase } from "./constants"

export function ActivitySection({ teamId }: { teamId: string }) {
  const { data } = useTeamActivity(teamId)
  const activity = data?.activity ?? []
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(activity.length / ACTIVITY_PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const start = current * ACTIVITY_PAGE_SIZE
  const visible = activity.slice(start, start + ACTIVITY_PAGE_SIZE)

  return (
    <Card className={cardBase}>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <>
            <div className="divide-y">
              {visible.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">
                      {a.actor?.display_name ?? "Someone"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {ACTIVITY_LABEL[a.action] ?? a.action.replace(/_/g, " ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            {pageCount > 1 ? (
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                <span className="text-xs text-muted-foreground">
                  Page {current + 1} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current === 0}
                    onClick={() => setPage(current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current >= pageCount - 1}
                    onClick={() => setPage(current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
