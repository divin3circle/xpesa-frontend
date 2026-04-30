"use client"

import { motion } from "motion/react"

import { AsteriskRevealHeading } from "@/components/ui/asterisk-reveal-heading"
import { Badge } from "@/components/ui/badge"
import { ServiceCard } from "@/components/ui/service-card"
import { audienceContent } from "@/lib/landing/audience-content"

export function WhoIsThisForSection() {
  return (
    <section id="who-for" className="py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-10 flex max-w-3xl flex-col items-start gap-4"
        >
          <Badge variant="outline" className="font-sans text-foreground/90">
            {audienceContent.badge}
          </Badge>
          <AsteriskRevealHeading
            as="h2"
            delayMs={820}
            text={audienceContent.heading}
            className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl"
          />
          <p className="font-sans text-base leading-relaxed text-foreground/75 md:text-lg">
            {audienceContent.description}
          </p>
        </motion.div>

        <motion.div
          className="grid gap-4 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
          }}
        >
          {audienceContent.archetypes.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: index * 0.02,
                }}
              >
                <ServiceCard
                  title={item.title}
                  description={item.description}
                  href={item.href}
                  imgSrc={item.imageSrc}
                  imgAlt={item.imageAlt}
                  bgColor={item.bgColor}
                  text={item.text}
                  icon={<Icon className="size-4" />}
                  variant={index % 2 === 0 ? "green" : "subtle"}
                  className="px-0"
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
