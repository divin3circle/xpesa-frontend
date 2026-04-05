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
  bgColor: "red-500" | "green-500" | "purple-500" | "background"
  text: "white" | "foreground"
  icon?: React.ReactNode
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  (
    {
      className,
      variant,
      title,
      description,
      href,
      imgSrc,
      imgAlt,
      bgColor,
      text,
    },
    ref
  ) => {
    return (
      <motion.div
        className={cn(cardVariants({ variant, className }))}
        ref={ref}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div
          className={cn(
            "relative z-10 flex h-64 flex-col rounded-2xl border border-background/10 p-6",
            `bg-${bgColor}`
          )}
        >
          <h3
            className={cn(
              "font-heading text-2xl font-semibold tracking-tight",
              `text-${text}`
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "mt-2 max-w-sm font-sans text-sm leading-relaxed",
              `text-${text}`
            )}
          >
            {description}
          </p>

          <a
            href={href}
            aria-label={`Learn more about ${title}`}
            className={cn(
              "mt-4 inline-flex items-center font-medium transition-all duration-300",
              `text-${text}`
            )}
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
          className="pointer-events-none absolute right-0 bottom-[10%] z-50 mx-2 h-28 w-38 object-cover opacity-75 saturate-125"
          whileHover={{ scale: 1.06, rotate: 2, x: 3, y: -2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.div>
    )
  }
)
ServiceCard.displayName = "ServiceCard"

export { ServiceCard }
