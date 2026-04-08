"use client"

import { Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

const sourceData = [
  { source: "Instagram", visitors: 18420, fill: "var(--color-instagram)" },
  { source: "Twitter/X", visitors: 12610, fill: "var(--color-twitter)" },
  { source: "WhatsApp", visitors: 9960, fill: "var(--color-whatsapp)" },
  { source: "YouTube", visitors: 6840, fill: "var(--color-youtube)" },
  { source: "Direct", visitors: 4210, fill: "var(--color-direct)" },
]

const chartConfig = {
  visitors: { label: "Visitors" },
  instagram: { label: "Instagram", color: "var(--color-chart-1)" },
  twitter: { label: "Twitter/X", color: "var(--color-chart-2)" },
  whatsapp: { label: "WhatsApp", color: "var(--color-chart-3)" },
  youtube: { label: "YouTube", color: "var(--color-chart-4)" },
  direct: { label: "Direct", color: "var(--color-chart-5)" },
} satisfies ChartConfig

export function TrafficSourcesPie() {
  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer config={chartConfig} className="h-60 w-full md:h-72">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="dot" />}
            />
            <Pie
              data={sourceData}
              dataKey="visitors"
              nameKey="source"
              innerRadius={58}
              outerRadius={82}
              strokeWidth={6}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="source" />}
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
