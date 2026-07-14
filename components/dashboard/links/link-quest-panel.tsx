"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuestTeaser } from "@/hooks/use-quests"

export function LinkQuestPanel({ linkId }: { linkId: string }) {
  const { data, isLoading } = useQuestTeaser(linkId)
  const quest = data?.quest

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quest</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading quest...</p>
        ) : quest ? (
          <>
            <p className="font-medium">{quest.title}</p>
            <p className="text-sm text-muted-foreground">
              {quest.question_count ?? 0} questions • {quest.participant_count ?? 0} players
            </p>
            <Button asChild variant="outline">
              <Link href={`/dashboard/quests/create?questId=${quest.id}&step=setup`}>
                Manage quest
              </Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              This content does not have an active quest yet.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/quests">Create quest</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
