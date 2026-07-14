"use client"

import { Button } from "@/components/ui/button"

type Props = {
  saving: boolean
  disabledPublish: boolean
  onSaveDraft: () => void
  onPublish: () => void
}

export function QuestBuilderFooter({
  saving,
  disabledPublish,
  onSaveDraft,
  onPublish,
}: Props) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onSaveDraft} disabled={saving}>
        Save draft
      </Button>
      <Button onClick={onPublish} disabled={disabledPublish}>
        Publish
      </Button>
    </div>
  )
}
