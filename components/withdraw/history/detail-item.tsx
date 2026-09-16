import { type LucideIcon } from "lucide-react"

export function DetailItem({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-muted/25 p-3">
      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium break-all">{value}</p>
    </div>
  )
}
