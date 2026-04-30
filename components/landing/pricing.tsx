"use client"

import { Check, ChevronRight, CreditCard, ExternalLink } from "lucide-react"
import { motion } from "motion/react"

import { AsteriskRevealHeading } from "@/components/ui/asterisk-reveal-heading"
import { SinglePricingCard } from "@/components/ui/single-pricing-card"
import { pricingContent } from "@/lib/landing/pricing-content"

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-1">
            <CreditCard className="size-3.5 text-primary" />
            <p className="font-sans text-xs font-semibold text-foreground">
              Pricing
            </p>
          </div>
          <AsteriskRevealHeading
            as="h2"
            delayMs={880}
            text={pricingContent.heading}
            className="mx-auto max-w-3xl font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl"
          />
          <p className="mx-auto mt-4 max-w-2xl text-foreground/75">
            {pricingContent.subtitle}
          </p>
        </motion.div>

        <SinglePricingCard
          badge={pricingContent.badge}
          title="Creator Plan"
          subtitle="Everything needed to start selling links and receiving support."
          price={pricingContent.price}
          benefits={pricingContent.benefits}
          features={pricingContent.features}
          featuresIcon={Check}
          featuresTitle={pricingContent.featuresTitle}
          primaryButton={{
            text: "Start free",
            icon: Check,
            chevronIcon: ChevronRight,
          }}
          secondaryButton={{
            text: "View docs",
            icon: ExternalLink,
            href: "#",
          }}
          testimonials={pricingContent.testimonials}
          testimonialRotationSpeed={4200}
          cardClassName="border-muted-foreground/70 bg-transparent"
        />
      </div>
    </section>
  )
}
