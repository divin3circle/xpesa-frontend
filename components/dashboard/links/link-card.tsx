import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkTypeBadge } from "./link-type-badge"
import { formatBytes, type LinkItem } from "./link-list-model"
import { ModerationStatusBadge } from "./moderation-status-badge"

export function LinkCard({ item }: { item: LinkItem }) {
  const router = useRouter()
  const approved = item.moderationStatus === "approved"

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{item.title}</CardTitle>
            <CardDescription>{item.stats}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LinkTypeBadge type={item.type} />
            <Badge>{item.price}</Badge>
            <ModerationStatusBadge status={item.moderationStatus} />
            <Badge variant={item.active ? "default" : "secondary"}>
              {item.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <LinkDetails item={item} />
        {item.moderationReason && item.moderationStatus !== "approved" ? (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {item.moderationReason}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={!approved}
            onClick={() => router.push(`/pay/${item.id}`)}
          >
            Open link
          </Button>
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="outline">Toggle status</Button>
          <Button size="sm" variant="destructive">Delete</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LinkDetails({ item }: { item: LinkItem }) {
  if (item.type === "document" && item.pageCount && item.fileSizeBytes) {
    return (
      <p className="text-sm text-muted-foreground">
        {item.pageCount} pages • {formatBytes(item.fileSizeBytes)}
      </p>
    )
  }
  if (item.type === "pack") {
    return (
      <p className="text-sm text-muted-foreground">
        {item.fileCount} files • {formatBytes(item.totalSizeBytes ?? 0)}
      </p>
    )
  }
  return null
}
