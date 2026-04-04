import { Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { heroCopy, heroStats } from "@/lib/landing/hero-content"

export function HeroCopyBlock() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-6 pt-14 pb-20 lg:px-10 lg:pt-20 lg:pb-28">
      <p className="mb-4 text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {heroCopy.eyebrow}
      </p>

      <h1 className="text-center font-heading text-3xl leading-[0.95] font-extrabold tracking-tight text-background md:text-6xl">
        {heroCopy.headingLead}
        <span className="mx-2 text-chart-1">{heroCopy.headingAccent}</span>
        {heroCopy.headingTail}
      </h1>

      <p className="mt-6 max-w-3xl text-center text-base leading-relaxed text-background/70 md:text-lg">
        {heroCopy.description}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button size="lg">Join Waitlist</Button>
        <Button
          size="lg"
          variant="secondary"
          className="border border-muted-foreground bg-white/10 text-background hover:bg-white/15"
        >
          <Play className="size-4" aria-hidden="true" />
          Start Earning Today
        </Button>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {heroStats.map((stat) => (
          <div
            key={stat.label}
            className="cursor-pointer rounded-2xl border-2 border-foreground p-4 shadow-chart-1 transition-all duration-150 ease-in hover:bg-chart-1/30 hover:shadow-sm"
          >
            <dt className="text-xs tracking-wider text-background/50 uppercase">
              {stat.label}
            </dt>
            <dd className="mt-2 text-sm font-medium text-background/90">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
