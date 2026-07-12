import { Badge } from "@/components/ui/badge"
import type { ModerationStatus } from "@/lib/links/types"

const labels: Record<ModerationStatus, string> = {
  pending_review: "Pending",
  approved: "Approved",
  needs_review: "Review",
  rejected: "Rejected",
  failed: "Failed",
}

export function ModerationStatusBadge({
  status,
}: {
  status: ModerationStatus
}) {
  const variant = status === "approved" ? "default" : "secondary"
  return <Badge variant={variant}>{labels[status] ?? "Pending"}</Badge>
}
