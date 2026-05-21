"use client"

import * as React from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { ArrowUpRight } from "lucide-react"
import { motion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AsteriskRevealHeading } from "@/components/ui/asterisk-reveal-heading"
import { ctaContent } from "@/lib/landing/cta-content"
import { useRouter } from "next/navigation"

type Testimonial1Props = {
  className?: string
}

export default function Testimonial1({ className }: Testimonial1Props) {
  const router = useRouter()
  return (
    <section id="cta" className={className}>
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-[2rem] p-6 md:p-10"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <Badge
              variant="outline"
              className="border-none font-sans text-foreground/90"
            >
              {ctaContent.badge}
            </Badge>
          </div>

          <AsteriskRevealHeading
            as="h2"
            delayMs={820}
            text={ctaContent.heading}
            className="max-w-4xl font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl"
          />

          <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-foreground/75 md:text-lg">
            {ctaContent.description}
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {ctaContent.points.map((point) => (
              <Tooltip.Provider key={point.label} delayDuration={120}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="cursor-pointer rounded-2xl border-2 border-foreground/10 p-4 shadow-chart-1 transition-all duration-150 ease-in hover:bg-chart-1/30 hover:shadow-sm">
                      <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                        {point.label}
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {point.value}
                      </p>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="bottom"
                      sideOffset={8}
                      className="z-50 max-w-xs rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg"
                    >
                      {point.description}
                      <Tooltip.Arrow className="fill-popover" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => {
              router.push("/waitlist")
            }}>{ctaContent.primaryCta}</Button>
            <Button
              variant={"link"}
              className="flex items-center gap-1 rounded-4xl px-4 py-2 transition-colors"
              onClick={() => {
                router.push("https://xpesa.mintlify.app/payments/overview")
              }
              }
            >
              {ctaContent.secondaryCta}
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
