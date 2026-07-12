import { Badge } from "@/components/ui/badge"
import type { LinkType } from "./link-list-model"

const styles: Record<LinkType, { label: string; className: string }> = {
  gate: {
    label: "GATE",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  document: {
    label: "DOC",
    className:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  pack: {
    label: "PACK",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  },
  tip: {
    label: "TIP",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  },
}

export function LinkTypeBadge({ type }: { type: LinkType }) {
  const badge = styles[type]
  return <Badge className={badge.className}>{badge.label}</Badge>
}
