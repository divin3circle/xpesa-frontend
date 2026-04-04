"use client"

import { HeroCopyBlock } from "@/components/landing/hero-copy"
import { HeroAnimation } from "@/components/landing/hero-animation"
import { HeroNav } from "@/components/landing/hero-nav"
import { HowItWorks } from "@/components/landing/how-it-works"
import { heroNavItems } from "@/lib/landing/hero-content"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-foreground px-2 md:px-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[72px_72px] opacity-20"
      />

      <HeroNav navItems={heroNavItems} />
      <HeroCopyBlock />
      <div className="mx-auto w-full max-w-6xl px-6 pb-16 lg:px-10">
        <HeroAnimation />
      </div>
      <HowItWorks />
    </section>
  )
}
