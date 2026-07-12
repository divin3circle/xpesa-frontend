import { Badge } from "@/components/ui/badge"

const filters = [
  ["all", "All"],
  ["pending_review", "Pending"],
  ["needs_review", "Needs review"],
  ["rejected", "Rejected"],
  ["failed", "Failed"],
  ["approved", "Approved"],
] as const

export function ModerationFilters({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(([key, label]) => (
        <Badge
          key={key}
          className="cursor-pointer px-3 py-1"
          variant={value === key ? "default" : "secondary"}
          onClick={() => onChange(key)}
        >
          {label}
        </Badge>
      ))}
    </div>
  )
}
