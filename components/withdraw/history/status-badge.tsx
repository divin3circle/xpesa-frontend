import { cn } from "@/lib/utils"

import { getStatusMeta } from "./utils"

export function StatusBadge({ status }: { status: string }) {
  const meta = getStatusMeta(status)
  const Icon = meta.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-2xl border px-2.5 py-1 text-xs font-medium capitalize",
        meta.badge
      )}
    >
      <Icon className="size-3.5" />
      {status}
    </span>
  )
}
