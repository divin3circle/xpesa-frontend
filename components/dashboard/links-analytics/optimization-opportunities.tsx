"use client"

import { AlertTriangle, Info, ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

const opportunities = [
  {
    label: "Low CTR links",
    value: "3 links",
    detail: "Need stronger CTA text",
    icon: AlertTriangle,
    tone: "text-amber-600 dark:text-amber-400",
    ring: "border-amber-500/30 bg-amber-500/10",
  },
]

export function OptimizationOpportunities() {
  return (
    <Card className={cardBase}>
      <CardHeader className="">
        <CardTitle className="text-md font-heading">
          Optimization Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="-mt-4 flex flex-col">
        {opportunities.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
          >
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <item.icon className="size-3.5" />
              <span>{item.label}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-md leading-none font-semibold">{item.value}</p>
              <p
                className={`inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground`}
              >
                <Info className="size-3" />
                {item.detail}
              </p>
            </div>
          </div>
        ))}
        <Button
          variant="ghost"
          className="flex w-full items-center justify-center gap-1 text-xs"
        >
          See More
          <ArrowRight className="" />
        </Button>
      </CardContent>
    </Card>
  )
}
