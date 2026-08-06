"use client"

import { cn } from "@/lib/utils"

export function QuestProgressHeader({
  title,
  current,
  total,
}: {
  title: string
  current: number
  total: number
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-xs tracking-[0.18em] text-muted-foreground uppercase">
          {title}
        </p>
        <p className="shrink-0 text-xs font-medium text-muted-foreground">
          Question {Math.min(current + 1, total)} of {total}
        </p>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= current ? "bg-foreground" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  )
}
