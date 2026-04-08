import { CreatorInsightsCards } from "@/components/dashboard/links-analytics/creator-insights-cards"
import { DemographicsAnalysis } from "@/components/dashboard/links-analytics/demographics-analysis"
import { EngagementHeatmap } from "@/components/dashboard/links-analytics/engagement-heatmap"
import { LinkMomentumStats } from "@/components/dashboard/links-analytics/link-momentum-stats"
import { MetricsCards } from "@/components/dashboard/links-analytics/metrics-cards"
import { OptimizationOpportunities } from "@/components/dashboard/links-analytics/optimization-opportunities"
import { RevenueConversionArea } from "@/components/dashboard/links-analytics/revenue-conversion-area"
import { TopLinksBar } from "@/components/dashboard/links-analytics/top-links-bar"
import { TrafficSourcesPie } from "@/components/dashboard/links-analytics/traffic-sources-pie"

export default function LinksAnalyticsPage() {
  return (
    <div className="space-y-6 overflow-x-hidden pb-4">
      <section className="space-y-2">
        <h1 className="font-heading text-xl font-semibold tracking-tight md:text-4xl">
          Links performance
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Understand what converts, where traffic comes from, and who your
          audience is so you can optimize every link.
        </p>
      </section>

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
  )
}
