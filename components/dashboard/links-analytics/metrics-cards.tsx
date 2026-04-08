"use client"

import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  Eye,
  HandCoins,
  MousePointerClick,
  Wallet,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

const periodMetrics = {
  "7d": [
    { label: "Total views", value: "18,204", delta: "+8.9%", icon: Eye },
    {
      label: "Unique visitors",
      value: "12,449",
      delta: "+4.2%",
      icon: MousePointerClick,
    },
    {
      label: "Successful payments",
      value: "694",
      delta: "+11.4%",
      icon: Wallet,
    },
    { label: "Revenue", value: "$4,902", delta: "+12.1%", icon: HandCoins },
  ],
  "30d": [
    { label: "Total views", value: "74,327", delta: "+12.8%", icon: Eye },
    {
      label: "Unique visitors",
      value: "51,084",
      delta: "+7.2%",
      icon: MousePointerClick,
    },
    {
      label: "Successful payments",
      value: "2,447",
      delta: "+15.9%",
      icon: Wallet,
    },
    { label: "Revenue", value: "$19,838", delta: "+18.3%", icon: HandCoins },
  ],
} as const

export function MetricsCards() {
  const [period, setPeriod] = useState<keyof typeof periodMetrics>("30d")

  const metrics = useMemo(() => periodMetrics[period], [period])

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Daily pulse of your link business
          </p>
        </div>
        <div className="inline-flex rounded-full border border-border/70 bg-muted/30 p-1">
          {(["7d", "30d"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                period === option
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <Card key={item.label} className={cardBase}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    {item.label}
                  </p>
                  <CardTitle className="mt-1 font-heading text-3xl">
                    {item.value}
                  </CardTitle>
                </div>
                <span className="inline-flex rounded-full border border-border/70 bg-muted/40 p-2">
                  <item.icon className="size-4" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                <ArrowUpRight className="size-3" />
                {item.delta}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
