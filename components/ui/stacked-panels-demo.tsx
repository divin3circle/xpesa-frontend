"use client"

import StackedPanels from "@/components/ui/stacked-panels-cursor-intereactive-component"

export default function StackedPanelsDemo() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <p className="pointer-events-none absolute top-8 left-1/2 z-20 -translate-x-1/2 font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
        Stacked Panels Canvas
      </p>

      <div className="h-full w-full">
        <StackedPanels />
      </div>

      <p className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Move cursor to interact
      </p>
    </section>
  )
}
