"use client"

import LoadingSpinner from "@/components/ui/loading-spinner"
import { useMyTeams } from "@/hooks/use-teams"

import { InviteSection } from "./_components/invite-section"
import { MembersSection } from "./_components/members-section"

export default function TeamPage() {
  const { data: teams, isLoading } = useMyTeams()
  const teamId = teams?.owned?.id ?? null

  if (isLoading) {
    return (
      <div className="grid min-h-[300px] place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          Invite other creators to view your analytics, and manage what they can do.
        </p>
      </section>

      <InviteSection teamId={teamId} />
      {teamId ? (
        <MembersSection teamId={teamId} />
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Your team is created the moment you send your first invite.
        </div>
      )}
    </div>
  )
}
