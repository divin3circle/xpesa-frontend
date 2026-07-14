"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Props = {
  open: boolean
  busy: boolean
  displayName: string
  onOpenChange: (open: boolean) => void
  onDisplayNameChange: (value: string) => void
  onStart: () => void
}

export function QuestEntryDialog({
  open,
  busy,
  displayName,
  onOpenChange,
  onDisplayNameChange,
  onStart,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join leaderboard</DialogTitle>
          <DialogDescription>
            This name will be shown on the creator&apos;s quest leaderboard.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder="Display name"
          maxLength={40}
        />
        <DialogFooter>
          <Button onClick={onStart} disabled={busy}>
            {busy ? "Starting..." : "Start quest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
