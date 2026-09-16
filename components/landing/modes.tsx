"use client"

import {
  CheckCircle2,
  Lock,
  HeartHandshake,
  FileText,
  Package,
} from "lucide-react"
import { motion } from "motion/react"

import { AsteriskRevealHeading } from "@/components/ui/asterisk-reveal-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { modesContent } from "@/lib/landing/modes-content"
import React from "react"

const MODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  document: FileText,
  pack: Package,
  gate: Lock,
  tip: HeartHandshake,
}

function FanMockup({
  heading,
  subheading,
  amount,
  localAmount,
  accent,
  buttonLabel,
  icon,
}: {
  heading: string
  subheading: string
  amount: string
  localAmount: string
  accent: string
  buttonLabel: string
  icon: React.ReactNode
}) {
  return (
    <div
      className={`rounded-3xl border border-white/15 bg-white/8 p-1 shadow backdrop-blur-sm md:p-4 ${accent.startsWith("S") ? "shadow-chart-1" : "shadow-pink-500"}`}
    >
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-foreground/85 p-4 text-background md:flex-row">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 font-sans text-xs font-bold tracking-[0.2em] text-background/55 uppercase">
            {icon}
            xpesa/goodcreator77
          </div>
          <h4 className="font-heading text-lg leading-tight font-semibold">
            {heading}
          </h4>
          <p className="mt-1 text-sm text-background/65">{subheading}</p>
        </div>
        <div className="flex w-full items-center justify-between rounded-2xl px-3 py-2 md:w-auto md:flex-col md:text-right">
          <p className="text-center text-lg tracking-[0.18em] text-background/55 uppercase md:text-right md:text-[10px]">
            Price
          </p>
          <div>
            <p className="font-heading text-sm font-semibold">{amount}</p>
            <p className="font-sans text-xs text-background/75">
              {localAmount}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-foreground/5 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Fan sees
          </p>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
            {accent}
          </span>
        </div>

        <div className="mt-4 grid gap-3 rounded-2xl border border-background/20 bg-foreground/50 p-4">
          <div className="h-3 w-3/4 rounded-full bg-background/12" />
          <div className="h-3 w-1/2 rounded-full bg-background/12" />
          <div className="h-24 rounded-2xl bg-background/20" />
          <Button size="lg" className="mt-2 w-full">
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ModesSection() {
  return (
    <section id="modes" className="py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-10 flex flex-col items-start gap-4 md:max-w-2xl"
        >
          <Badge variant="outline" className="font-sans text-foreground/90">
            Four ways to sell
          </Badge>
          <AsteriskRevealHeading
            as="h2"
            delayMs={800}
            text="Sell a document, pack, gated link, or tip"
            className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl"
          />
          <p className="font-sans text-base leading-relaxed text-foreground/75 md:text-lg">
            Pick the format that fits — a single file, a bundled pack, a gated
            link, or a tip jar. Fans get one clean checkout either way.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
        >
          {modesContent.map((mode) => {
            const Icon = MODE_ICONS[mode.value] ?? Lock
            return (
              <motion.article
                key={mode.value}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="rounded-[2rem] border border-muted-foreground/70 px-2 py-6 shadow-sm md:p-6"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid size-11 place-items-center rounded-2xl text-chart-1">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      {mode.eyebrow}
                    </p>
                    <h3 className="font-heading text-2xl font-semibold text-foreground">
                      {mode.label}
                    </h3>
                  </div>
                </div>

                <p className="max-w-xl font-sans text-base leading-relaxed text-foreground/75">
                  {mode.title}
                </p>

                <div className="mt-6 grid gap-4">
                  <div>
                    <ul className="space-y-3">
                      {mode.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-sm text-foreground/75"
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-chart-1" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-sm leading-relaxed text-foreground/55">
                      {mode.description}
                    </p>
                  </div>

                  <FanMockup
                    heading={mode.mockup.heading}
                    subheading={mode.mockup.subheading}
                    amount={mode.mockup.amount}
                    localAmount={mode.mockup.localAmount}
                    accent={mode.mockup.accent}
                    buttonLabel={mode.mockup.buttonLabel}
                    icon={<Icon className="size-3.5" />}
                  />
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
