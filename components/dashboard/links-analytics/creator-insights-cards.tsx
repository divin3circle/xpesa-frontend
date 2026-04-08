"use client"

import { ArrowRight, CircleDashed, Crown, Gem, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const cardBase =
  "rounded-2xl border border-border/70 bg-transparent shadow-none"

const insights = [
  {
    title: "Best Performing Offer",
    value: "React Native Crash Course",
    detail: "Converts at 16.7% from Instagram stories",
    icon: Crown,
  },
  {
    title: "Revenue Concentration",
    value: "62% from top 3 links",
    detail: "Consider rotating underperformers weekly",
    icon: Gem,
  },
  {
    title: "Drop-off Alert",
    value: "Checkout step 2 - 23% exit",
    detail: "Simplify fee breakdown for mobile users",
    icon: CircleDashed,
  },
]

const actions = [
  "Pin top offer on bio link this weekend",
  "A/B test CTA copy for low-converting links",
  "Schedule new campaign for Thu evening peak",
]

export function CreatorInsightsCards() {
  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="font-heading text-lg">Creator Insights</CardTitle>
          <Badge variant="outline" className="gap-1">
            <Zap className="size-3" />
            Actionable
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {insights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border/60 bg-muted/20 px-3 py-3"
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <item.icon className="size-3.5" />
                {item.title}
              </div>
              <p className="text-sm font-medium">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="mb-2 text-xs font-medium tracking-wide text-primary uppercase">
            Recommended Next Steps
          </p>
          <div className="space-y-2">
            {actions.map((action) => (
              <div
                key={action}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
