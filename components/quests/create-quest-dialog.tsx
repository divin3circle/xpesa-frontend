"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateQuest } from "@/hooks/use-quests"
import type { Link } from "@/lib/links/types"
import type { CreatorQuestRow } from "./creator-quest-types"

export function CreateQuestDialog({
  open,
  onOpenChange,
  links,
  quests,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  links: Link[]
  quests: CreatorQuestRow[]
}) {
  const router = useRouter()
  const createQuest = useCreateQuest()
  const [linkId, setLinkId] = useState("")
  const questedLinks = useMemo(
    () => new Set(quests.map((q) => q.link_id)),
    [quests]
  )
  const eligible = links.filter((link) => link.type !== "tip")

  async function handleNext() {
    const link = links.find((item) => item.id === linkId)
    if (!link) return
    try {
      const result = await createQuest.mutateAsync({
        linkId,
        title: `${link.title} Quest`,
        description: link.description ?? undefined,
      })
      router.push(`/dashboard/quests/create?questId=${result.quest.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create quest"
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold">
            Create quest
          </DialogTitle>
          <DialogDescription>
            Each content link can have one quest. Pending or already-used links
            are disabled.
          </DialogDescription>
        </DialogHeader>
        <Select value={linkId} onValueChange={setLinkId}>
          <SelectTrigger className="h-11 w-3/4">
            <SelectValue placeholder="Select content" />
          </SelectTrigger>
          <SelectContent>
            {eligible.map((link) => (
              <SelectItem
                key={link.id}
                value={link.id}
                disabled={
                  link.moderation_status !== "approved" ||
                  questedLinks.has(link.id)
                }
              >
                {link.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button
            onClick={handleNext}
            disabled={!linkId || createQuest.isPending}
          >
            {createQuest.isPending ? "Creating..." : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
