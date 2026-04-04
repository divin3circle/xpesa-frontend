"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "text-foreground",
        green: "text-chart-1",
        subtle: "text-foreground/85",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ServiceCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  title: string
  description: string
  href: string
  imgSrc: string
  imgAlt: string
  icon?: React.ReactNode
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  (
    { className, variant, title, description, href, imgSrc, imgAlt, icon },
    ref
  ) => {
    return (
      <motion.div
        className={cn(cardVariants({ variant, className }))}
        ref={ref}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
            {icon}
          </div>

          <h3 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h3>
          <p className="mt-2 max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          <a
            href={href}
            aria-label={`Learn more about ${title}`}
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary uppercase"
          >
            Learn more
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ArrowRight className="size-4" />
            </motion.span>
          </a>
        </div>

        <motion.img
          src={imgSrc}
          alt={imgAlt}
          className="pointer-events-none absolute right-0 bottom-0 h-24 w-24 rounded-xl object-cover opacity-75 saturate-125"
          whileHover={{ scale: 1.06, rotate: 2, x: 3, y: -2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.div>
    )
  }
)
ServiceCard.displayName = "ServiceCard"

export { ServiceCard }
