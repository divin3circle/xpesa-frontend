"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDay } from "./analytics-format"

const cardBase = "rounded-2xl border border-border/70 bg-transparent shadow-none"

export function TimeSeriesBar({
  title,
  data,
  label,
  color = "var(--color-chart-2)",
}: {
  title: string
  label: string
  data: { date: string; count: number }[]
  color?: string
}) {
  const chartConfig = {
    count: { label, color },
  } satisfies ChartConfig

  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        {data.length === 0 ? (
          <div className="grid h-60 place-items-center text-sm text-muted-foreground md:h-72">
            No data for this period yet.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-60 w-full md:h-72">
            <BarChart data={data} margin={{ left: 8, right: 8, top: 10 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatDay}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(value) => formatDay(String(value))}
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={6}
                maxBarSize={56}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
