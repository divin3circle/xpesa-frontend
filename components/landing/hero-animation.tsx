"use client"

import { motion } from "motion/react"

import StackedPanels from "@/components/ui/stacked-panels-cursor-intereactive-component"

export function HeroAnimation() {
  return (
    <motion.div
      className="relative h-115 w-full overflow-hidden md:h-135"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
      <StackedPanels />
      <motion.p
        className="pointer-events-none absolute bottom-0 font-sans text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase md:bottom-3 md:left-1/2 md:-translate-x-1/2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
      >
        what your creator economy needs
      </motion.p>
    </motion.div>
  )
}
