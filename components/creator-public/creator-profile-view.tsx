import type {
  CreatorPublicProfile,
  LinkPublic,
} from "@/app/api/public/creator/[handle]/route"

import { CreatorHeroCard } from "@/components/creator-public/creator-hero-card"
import { CreatorInsightsGrid } from "@/components/creator-public/creator-insights-grid"
import { CreatorKpiStack } from "@/components/creator-public/creator-kpi-stack"
import { CreatorLinksGrid } from "@/components/creator-public/creator-links-grid"

type CreatorProfileViewProps = {
  creator: CreatorPublicProfile
  links: LinkPublic[]
}

export function CreatorProfileView({
  creator,
  links,
}: CreatorProfileViewProps) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4 md:space-y-6 md:p-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
        <CreatorHeroCard creator={creator} />

        <CreatorKpiStack handle={creator.handle} />
      </section>

      <CreatorInsightsGrid handle={creator.handle} />

      <CreatorLinksGrid links={links} />
    </div>
  )
}
