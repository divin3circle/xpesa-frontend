"use client"

import { cn } from "@/lib/utils"

export const PERIOD_OPTIONS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
  { value: "all", label: "All time" },
] as const

export type PeriodValue = (typeof PERIOD_OPTIONS)[number]["value"]

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodValue
  onChange: (value: PeriodValue) => void
}) {
  return (
    <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-border/70 bg-muted/30 p-1">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition",
            value === option.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
