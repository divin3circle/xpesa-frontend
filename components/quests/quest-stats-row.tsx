"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreatorQuestRow } from "./creator-quest-types"

export function QuestStatsRow({ quests }: { quests: CreatorQuestRow[] }) {
  const active = quests.filter((quest) => quest.status === "active").length
  const submissions = quests.reduce(
    (sum, quest) => sum + (quest.quest_attempts?.filter((a) => a.status === "submitted").length ?? 0),
    0
  )
  const topScore = Math.max(
    0,
    ...quests.flatMap((quest) => quest.quest_attempts?.map((a) => Number(a.score ?? 0)) ?? [])
  )
  const cards = [
    ["Total quests", quests.length, "All created quests"],
    ["Active quests", active, "Currently playable"],
    ["Submissions", submissions, "Submitted results"],
    ["Top score", topScore, "Best score earned"],
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, helper]) => (
        <Card key={label} className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>{label}</CardDescription>
            <CardTitle className="font-heading text-3xl">{value}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            {helper}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
