"use client"

import { useState } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { CreatorInsightsCards } from "@/components/dashboard/links-analytics/creator-insights-cards"
import { DemographicsAnalysis } from "@/components/dashboard/links-analytics/demographics-analysis"
import { EngagementHeatmap } from "@/components/dashboard/links-analytics/engagement-heatmap"
import { LinkMomentumStats } from "@/components/dashboard/links-analytics/link-momentum-stats"
import { MetricsCards } from "@/components/dashboard/links-analytics/metrics-cards"
import { OptimizationOpportunities } from "@/components/dashboard/links-analytics/optimization-opportunities"
import { RevenueConversionArea } from "@/components/dashboard/links-analytics/revenue-conversion-area"
import { TopLinksBar } from "@/components/dashboard/links-analytics/top-links-bar"
import { TrafficSourcesPie } from "@/components/dashboard/links-analytics/traffic-sources-pie"
import { QuestsAnalyticsPanel } from "@/components/dashboard/quests-analytics/quests-analytics-panel"

type Tab = "quests" | "links"

const TABS: { key: Tab; label: string }[] = [
  { key: "quests", label: "Quests & Leaderboards" },
  { key: "links", label: "Links (coming soon)" },
]

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("quests")

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-heading text-xl font-semibold tracking-tight md:text-4xl">
          Analytics
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Understand how your quests and content perform — who shows up, who
          finishes, and where people drop off.
        </p>
      </section>

      <div className="inline-flex gap-1 rounded-full border border-border/70 bg-muted/30 p-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              tab === item.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "quests" ? <QuestsAnalyticsPanel /> : <LinksComingSoon />}
    </div>
  )
}

function LinksComingSoon() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl backdrop-blur-md">
        <p className="text-xl font-semibold">Links analytics coming soon</p>
        <Image
          src="/unreleased.webp"
          alt="Coming soon"
          width={260}
          height={170}
          className="my-6"
        />
        <p className="md:text-md max-w-lg px-2 text-center font-sans text-sm text-foreground/90">
          Detailed link-level analytics are on the way. Quest &amp; leaderboard
          analytics are live in the tab above.
        </p>
      </div>

      <div className="space-y-4">
        <MetricsCards />
        <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0">
            <RevenueConversionArea />
          </div>
          <div className="min-w-0">
            <TrafficSourcesPie />
          </div>
        </section>
        <section className="grid gap-3 md:grid-cols-2">
          <div className="min-w-0 space-y-3">
            <TopLinksBar />
            <LinkMomentumStats />
            <OptimizationOpportunities />
          </div>
          <div className="min-w-0 space-y-4">
            <DemographicsAnalysis />
          </div>
        </section>
        <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0">
            <EngagementHeatmap />
          </div>
          <div className="min-w-0">
            <CreatorInsightsCards />
          </div>
        </section>
      </div>
    </div>
  )
}
