"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CreatorQuestRow } from "./creator-quest-types"

function labelReward(value: string) {
  if (value === "top_1") return "Top 1"
  if (value === "top_3") return "Top 3"
  return "No reward"
}

export function QuestsTable({ quests }: { quests: CreatorQuestRow[] }) {
  if (!quests.length) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No quests yet. Create one from an approved content link.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Quest</th>
            <th className="px-4 py-3 font-medium">Content</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Submissions</th>
            <th className="px-4 py-3 font-medium">Reward</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {quests.map((quest) => (
            <tr key={quest.id}>
              <td className="px-4 py-3 font-medium">{quest.title}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {quest.link?.title ?? "Untitled"}
              </td>
              <td className="px-4 py-3">
                <Badge variant={quest.status === "active" ? "default" : "secondary"}>
                  {quest.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {quest.quest_attempts?.filter((a) => a.status === "submitted").length ?? 0}
              </td>
              <td className="px-4 py-3">{labelReward(quest.reward_mode)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/quests/${quest.id}`}>Review</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/quests/create?questId=${quest.id}`}>Edit</Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
