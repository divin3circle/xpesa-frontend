"use client"

import StackedPanels from "@/components/ui/stacked-panels-cursor-intereactive-component"

export function HeroAnimation() {
  return (
    <div className="relative h-105 w-full overflow-hidden md:h-125">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
      <StackedPanels />
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-sans text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        all your creator economy needs
      </p>
    </div>
  )
}
