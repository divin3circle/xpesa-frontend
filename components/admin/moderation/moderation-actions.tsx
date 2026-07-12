import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ModerationStatus } from "@/lib/links/types"

export function ModerationActions({
  onAction,
}: {
  onAction: (status: ModerationStatus | "analyze_ai", reason?: string) => void
}) {
  const [reason, setReason] = useState("")

  return (
    <div className="space-y-3">
      <Textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason for rejection or review note"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onAction("approved", "Manual approval")}>
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onAction("rejected", reason || "Rejected by admin")}
        >
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAction("analyze_ai")}
        >
          Analyze with AI
        </Button>
      </div>
    </div>
  )
}
