"use client"

import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { QuestsAnalyticsPanel } from "@/components/dashboard/quests-analytics/quests-analytics-panel"
import { useMyTeams } from "@/hooks/use-teams"

export default function TeamAnalyticsPage() {
  const params = useParams<{ teamId: string }>()
  const { data, isLoading } = useMyTeams()

  if (isLoading) {
    return (
      <div className="grid min-h-[300px] place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  const membership = data?.memberships.find((m) => m.team_id === params.teamId)

  if (!membership) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
        You don&apos;t have access to this team, or it no longer exists.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Shared team analytics
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {membership.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Owned by {membership.owner.display_name} (@{membership.owner.handle})
          </p>
        </div>
        <Badge variant="outline" className="w-fit capitalize">
          You are {membership.role}
        </Badge>
      </section>

      <QuestsAnalyticsPanel
        ownerId={membership.owner.id}
        canExport={membership.can_export}
      />
    </div>
  )
}
