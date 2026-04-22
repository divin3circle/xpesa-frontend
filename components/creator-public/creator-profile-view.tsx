import type {
  CreatorPublicProfile,
  LinkPublic,
} from "@/app/api/public/creator/[handle]/route"
import type { CreatorAnalytics } from "@/lib/mock/creator-analytics"

import { CreatorHeroCard } from "@/components/creator-public/creator-hero-card"
import { CreatorInsightsGrid } from "@/components/creator-public/creator-insights-grid"
import { CreatorKpiStack } from "@/components/creator-public/creator-kpi-stack"
import { CreatorLinksGrid } from "@/components/creator-public/creator-links-grid"
import { Skeleton } from "@/components/ui/skeleton"

type CreatorProfileViewProps = {
  creator: CreatorPublicProfile
  links: LinkPublic[]
  analytics: CreatorAnalytics | undefined
  isAnalyticsLoading: boolean
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-2xl" />
      ))}
    </div>
  )
}

export function CreatorProfileView({
  creator,
  links,
  analytics,
  isAnalyticsLoading,
}: CreatorProfileViewProps) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4 md:space-y-6 md:p-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
        <CreatorHeroCard
          creator={creator}
          primaryNetwork={analytics?.primaryNetwork ?? "Base"}
        />

        {isAnalyticsLoading || !analytics ? (
          <AnalyticsSkeleton />
        ) : (
          <CreatorKpiStack analytics={analytics} />
        )}
      </section>

      <CreatorInsightsGrid
        analytics={
          analytics ?? {
            totalProfileViews: 0,
            confirmedSales: 0,
            netEarningsUsdc: 0,
            uniqueSupporters: 0,
            totalFeesUsdc: 0,
            totalRevenueUsdc: 0,
            primaryNetwork: "Base",
            averagePriceUsdc: 0,
            conversionRate: 0,
            topContentType: "N/A",
          }
        }
        activeLinks={links.length}
      />

      <CreatorLinksGrid links={links} />
    </div>
  )
}
