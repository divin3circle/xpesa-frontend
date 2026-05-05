import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type {
  InsightCardId,
  InsightChartPoint,
} from "@/lib/analytics/creator-insights"

type CreatorInsightChartProps = {
  id: InsightCardId
  data: InsightChartPoint[]
}

function getChartColorToken(id: InsightCardId): string {
  switch (id) {
    case "active-links":
      return "var(--chart-1)"
    case "average-price":
      return "var(--chart-2)"
    case "primary-content":
      return "var(--chart-3)"
    case "unique-supporters":
      return "var(--chart-4)"
    case "total-fees":
      return "var(--chart-5)"
    case "conversion-rate":
      return "var(--chart-1)"
    default:
      return "var(--chart-1)"
  }
}

function getChartConfig(id: InsightCardId): ChartConfig {
  return {
    value: {
      label: "Value",
      color: getChartColorToken(id),
    },
  }
}

export function CreatorInsightChart({ id, data }: CreatorInsightChartProps) {
  const chartData = data.length > 0 ? data : [{ label: "N/A", value: 0 }]
  const chartConfig = getChartConfig(id)

  if (
    id === "active-links" ||
    id === "primary-content" ||
    id === "conversion-rate"
  ) {
    return (
      <ChartContainer config={chartConfig} className="h-3/4 w-full px-2">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 0, right: 0, top: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => String(value).slice(0, 6)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={6} />
        </BarChart>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-28 w-full px-2">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 0, right: 0, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => String(value).slice(0, 6)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Area
          dataKey="value"
          type="monotone"
          fill="var(--color-value)"
          fillOpacity={0.2}
          stroke="var(--color-value)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
