"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CreateQuestDialog } from "@/components/quests/create-quest-dialog"
import { QuestStatsRow } from "@/components/quests/quest-stats-row"
import { QuestsTable } from "@/components/quests/quests-table"
import type { CreatorQuestRow } from "@/components/quests/creator-quest-types"
import { useMyLinks } from "@/hooks/use-links"
import { useCreatorQuests } from "@/hooks/use-quests"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function QuestsPage() {
  const [open, setOpen] = useState(false)
  const { data: linksData } = useMyLinks()
  const { data, isLoading } = useCreatorQuests()
  const quests = (data?.quests ?? []) as CreatorQuestRow[]

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Quests
          </h1>
          <p className="text-sm text-muted-foreground">
            Turn unlocked content into competitive challenges and leaderboards.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Create Quest</Button>
      </section>

      <QuestStatsRow quests={quests} />

      <section>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border p-6 text-sm text-muted-foreground">
            <LoadingSpinner />
            Loading quests...
          </div>
        ) : (
          <QuestsTable quests={quests} />
        )}
      </section>

      <CreateQuestDialog
        open={open}
        onOpenChange={setOpen}
        links={linksData?.links ?? []}
        quests={quests}
      />
    </div>
  )
}
