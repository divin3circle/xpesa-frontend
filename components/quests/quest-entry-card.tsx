"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gamepad2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useQuestTeaser } from "@/hooks/use-quests"
import { postQuestJson } from "@/lib/quests/client"
import { QuestEntryDialog } from "@/components/quests/quest-entry-dialog"

export function QuestEntryCard({
  linkId,
  accessToken,
  walletAddress,
  isAuthorized,
}: {
  linkId: string
  accessToken: string
  walletAddress: string
  isAuthorized: boolean
}) {
  const router = useRouter()
  const { data } = useQuestTeaser(linkId)
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [busy, setBusy] = useState(false)
  const quest = data?.quest

  async function startQuest() {
    if (!quest) return
    if (!displayName.trim()) {
      toast.error("Enter a name for the leaderboard")
      return
    }
    setBusy(true)
    try {
      const participant = await postQuestJson<{ participant: { id: string } }>(
        `/api/quests/${quest.id}/participants`,
        { accessToken, displayName, walletAddress }
      )
      const attempt = await postQuestJson<{ attempt: { id: string } }>(
        `/api/quests/${quest.id}/attempts`,
        { accessToken, participantId: participant.participant.id }
      )
      router.push(`/quest/${quest.id}/play?attemptId=${attempt.attempt.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start quest"
      )
    } finally {
      setBusy(false)
    }
  }

  if (!isAuthorized || !quest) return null

  return (
    <section className="mb-5 rounded-2xl border bg-lime-50 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-emerald-700 uppercase">
            Quest unlocked
          </p>
          <h2 className="font-heading text-xl font-semibold text-emerald-950">
            {quest.title}
          </h2>
          <p className="text-sm text-emerald-900/70">
            Enter the challenge and compete on the creator leaderboard.
          </p>
        </div>
        <Button
          className="bg-emerald-950 text-white hover:bg-emerald-900"
          onClick={() => setOpen(true)}
        >
          <Gamepad2 className="size-4" />
          Enter quest
        </Button>
      </div>
      <QuestEntryDialog
        open={open}
        busy={busy}
        displayName={displayName}
        onOpenChange={setOpen}
        onDisplayNameChange={setDisplayName}
        onStart={startQuest}
      />
    </section>
  )
}
