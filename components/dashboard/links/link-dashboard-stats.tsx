"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Stat = {
  label: string
  value: string
  detail: string
}

export function LinkDashboardStats({ stats }: { stats: Stat[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
