"use client"

import { Fragment } from "react"

import { CalendarDays, Sparkles } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const heatmapData = [
  { week: "W1", values: [18, 24, 30, 42, 51, 28, 20] },
  { week: "W2", values: [22, 27, 36, 48, 56, 34, 24] },
  { week: "W3", values: [20, 31, 45, 53, 62, 39, 29] },
  { week: "W4", values: [25, 33, 47, 58, 70, 44, 31] },
]

function getCellClass(value: number) {
  if (value >= 60) return "bg-primary/90"
  if (value >= 45) return "bg-primary/70"
  if (value >= 30) return "bg-primary/50"
  if (value >= 20) return "bg-primary/35"
  return "bg-muted"
}

export function EngagementHeatmap() {
  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="font-heading text-lg">
              Engagement Heatmap
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Weekly tap intensity across your publishing calendar
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            Last 4 weeks
          </span>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <div className="grid grid-cols-8 gap-1.5 text-xs sm:gap-2">
          <span className="text-center text-[11px] text-muted-foreground/70">
            Week
          </span>
          {weekDays.map((day) => (
            <span
              key={day}
              className="text-center text-[11px] text-muted-foreground"
            >
              {day}
            </span>
          ))}

          {heatmapData.map((row) => (
            <Fragment key={row.week}>
              <span
                key={`${row.week}-label`}
                className="self-center text-[11px] text-muted-foreground"
              >
                {row.week}
              </span>
              {row.values.map((value, index) => (
                <div
                  key={`${row.week}-${weekDays[index]}`}
                  title={`${row.week} ${weekDays[index]}: ${value} interactions`}
                  className={cn(
                    "h-7 rounded-md transition hover:scale-[1.03] sm:h-8",
                    getCellClass(value)
                  )}
                />
              ))}
            </Fragment>
          ))}
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="size-3.5" />
            Best posting window
          </span>
          <span className="font-medium">Thu-Fri, 6:00 PM - 9:00 PM</span>
        </div>
      </CardContent>
    </Card>
  )
}
