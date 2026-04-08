"use client"

import { ArrowUpRight, Repeat2, ShieldCheck, Timer } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

const momentumStats = [
  {
    label: "Repeat supporters",
    value: "34%",
    detail: "+4.1% vs last month",
    icon: Repeat2,
  },
  {
    label: "Median checkout time",
    value: "42s",
    detail: "-8s improvement",
    icon: Timer,
  },
  {
    label: "Successful payout ratio",
    value: "97.8%",
    detail: "Stable payout reliability",
    icon: ShieldCheck,
  },
]

export function LinkMomentumStats() {
  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">Link Momentum</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {momentumStats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
          >
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <item.icon className="size-3.5" />
              <span>{item.label}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg leading-none font-semibold">{item.value}</p>
              <p className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3" />
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
