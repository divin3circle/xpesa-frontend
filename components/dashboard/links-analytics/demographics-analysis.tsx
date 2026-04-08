"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

const ageData: Record<"7d" | "30d", Array<{ age: string; users: number }>> = {
  "7d": [
    { age: "18-24", users: 1180 },
    { age: "25-34", users: 2910 },
    { age: "35-44", users: 1630 },
    { age: "45-54", users: 840 },
    { age: "55+", users: 422 },
  ],
  "30d": [
    { age: "18-24", users: 4840 },
    { age: "25-34", users: 10840 },
    { age: "35-44", users: 6320 },
    { age: "45-54", users: 3140 },
    { age: "55+", users: 1612 },
  ],
}

const geoData = [
  { country: "Kenya", share: 42 },
  { country: "Nigeria", share: 21 },
  { country: "South Africa", share: 15 },
  { country: "Ghana", share: 11 },
  { country: "Other", share: 11 },
]

const deviceData = [
  { device: "Mobile", share: 78 },
  { device: "Desktop", share: 18 },
  { device: "Tablet", share: 4 },
]

const chartConfig = {
  users: {
    label: "Users",
    color: "var(--color-chart-4)",
  },
} satisfies ChartConfig

export function DemographicsAnalysis() {
  const [period, setPeriod] = useState<keyof typeof ageData>("30d")

  const chartData = useMemo(() => ageData[period], [period])

  return (
    <section className="grid gap-4 2xl:grid-cols-3">
      <Card className={cn(cardBase, "2xl:col-span-2")}>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="font-heading text-lg">
              Audience by Age Group
            </CardTitle>
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
        </CardHeader>
        <CardContent className="min-w-0">
          <ChartContainer config={chartConfig} className="h-60 w-full md:h-72">
            <BarChart data={chartData} margin={{ left: 8, right: 8, top: 10 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="age"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="users" fill="var(--color-users)" radius={10} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className={cn(cardBase, "h-full")}>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg">
            Demographic Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Top Countries
            </p>
            {geoData.map((item) => (
              <div key={item.country} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.country}</span>
                  <span className="text-muted-foreground">{item.share}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Device Mix
            </p>
            {deviceData.map((item) => (
              <div
                key={item.device}
                className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-sm"
              >
                <span>{item.device}</span>
                <span className="font-medium">{item.share}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
