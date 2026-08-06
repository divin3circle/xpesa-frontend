"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type KpiItem = {
  label: string
  value: string | number
  helper?: string
}

export function KpiCards({ items }: { items: KpiItem[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="font-heading text-3xl">{item.value}</CardTitle>
          </CardHeader>
          {item.helper ? (
            <CardContent className="pt-0 text-xs text-muted-foreground">
              {item.helper}
            </CardContent>
          ) : null}
        </Card>
      ))}
    </section>
  )
}
