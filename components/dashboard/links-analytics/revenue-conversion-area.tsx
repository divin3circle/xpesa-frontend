"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

const chartData = [
  { day: "Mon", views: 2900, paid: 104 },
  { day: "Tue", views: 3400, paid: 132 },
  { day: "Wed", views: 3180, paid: 121 },
  { day: "Thu", views: 4020, paid: 166 },
  { day: "Fri", views: 4880, paid: 201 },
  { day: "Sat", views: 3760, paid: 149 },
  { day: "Sun", views: 3520, paid: 144 },
]

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--color-chart-2)",
  },
  paid: {
    label: "Payments",
    color: "var(--color-chart-4)",
  },
} satisfies ChartConfig

export function RevenueConversionArea() {
  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">
          Traffic vs Payments Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer config={chartConfig} className="h-60 w-full md:h-72">
          <AreaChart data={chartData} margin={{ left: 4, right: 4, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              cursor={false}
            />
            <Area
              dataKey="views"
              type="monotone"
              fill="var(--color-views)"
              fillOpacity={0.2}
              stroke="var(--color-views)"
              strokeWidth={2}
            />
            <Area
              dataKey="paid"
              type="monotone"
              fill="var(--color-paid)"
              fillOpacity={0.22}
              stroke="var(--color-paid)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
