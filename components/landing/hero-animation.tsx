"use client"

import StackedPanels from "@/components/ui/stacked-panels-cursor-intereactive-component"

export function HeroAnimation() {
  return (
    <div className="relative h-115 w-full overflow-hidden md:h-135">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
      <StackedPanels />
      <p className="pointer-events-none absolute bottom-0 font-sans text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase md:bottom-3 md:left-1/2 md:-translate-x-1/2">
        what your creator economy needs
      </p>
    </div>
  )
}
