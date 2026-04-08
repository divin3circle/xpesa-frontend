"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

const linksData = [
  { link: "RN Crash Course", earnings: 396, conv: 16.7 },
  { link: "Design Teardown", earnings: 282, conv: 14.3 },
  { link: "Premium JS Notes", earnings: 240, conv: 12.8 },
  { link: "Buy me chai", earnings: 148, conv: 11.1 },
  { link: "Prompt Bundle", earnings: 124, conv: 8.5 },
]

const chartConfig = {
  earnings: {
    label: "Earnings (USD)",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig

export function TopLinksBar() {
  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">
          Top Earning Links
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer config={chartConfig} className="h-60 w-full md:h-72">
          <BarChart
            accessibilityLayer
            data={linksData}
            layout="vertical"
            margin={{ left: 6, right: 8 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="link"
              type="category"
              tickLine={false}
              axisLine={false}
              width={86}
              tickFormatter={(value) =>
                String(value).length > 12
                  ? `${String(value).slice(0, 12)}...`
                  : String(value)
              }
            />
            <XAxis type="number" hide />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar dataKey="earnings" radius={8} fill="var(--color-earnings)">
              <LabelList
                dataKey="earnings"
                position="insideRight"
                formatter={(value) => `$${Number(value)}`}
                className="fill-background"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
