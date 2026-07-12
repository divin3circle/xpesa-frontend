import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModerationStatusBadge } from "@/components/dashboard/links/moderation-status-badge"
import { ModerationActions } from "./moderation-actions"
import type { AdminModerationLink } from "./types"
import type { ModerationStatus } from "@/lib/links/types"

export function ModerationCard({
  link,
  onAction,
}: {
  link: AdminModerationLink
  onAction: (
    linkId: string,
    status: ModerationStatus | "analyze_ai",
    reason?: string
  ) => void
}) {
  const creator = link.creator?.handle
    ? `@${link.creator.handle}`
    : (link.creator?.display_name ?? "Unknown creator")

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{link.title}</CardTitle>
            <CardDescription>
              {creator} • {link.type} • {link.price_usdc ?? 0} USDC
            </CardDescription>
          </div>
          <ModerationStatusBadge status={link.moderation_status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {link.description || "No description provided."}
        </p>
        {link.destination_url ? (
          <p className="break-all text-xs text-muted-foreground">
            {link.destination_url}
          </p>
        ) : null}
        {link.moderation_score !== null ? (
          <p className="text-xs font-medium text-muted-foreground">
            AI score: {Number(link.moderation_score).toFixed(3)}
          </p>
        ) : null}
        {link.moderation_reason ? (
          <p className="rounded-md bg-muted px-3 py-2 text-sm">
            {link.moderation_reason}
          </p>
        ) : null}
        <ModerationActions
          onAction={(status, reason) => onAction(link.id, status, reason)}
        />
      </CardContent>
    </Card>
  )
}
