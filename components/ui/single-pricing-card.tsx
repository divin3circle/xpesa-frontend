"use client"

import type { LucideIcon } from "lucide-react"
import { Star } from "lucide-react"
import { AnimatePresence, motion, useInView } from "motion/react"
import Link from "next/link"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  rating: number
}

export interface Feature {
  text: string
}

export interface Benefit {
  text: string
  icon: LucideIcon
}

export interface SinglePricingCardProps {
  badge?: { icon: LucideIcon; text: string }
  title: string
  subtitle: string
  price: {
    current: string
    original?: string
    discount?: string
  }
  benefits: Benefit[]
  features: Feature[]
  featuresIcon: LucideIcon
  featuresTitle?: string
  primaryButton: {
    text: string
    icon: LucideIcon
    href?: string
    onClick?: () => void
    chevronIcon?: LucideIcon
  }
  secondaryButton?: {
    text: string
    icon: LucideIcon
    href?: string
    onClick?: () => void
  }
  testimonials: Testimonial[]
  testimonialRotationSpeed?: number
  animationEnabled?: boolean
  className?: string
  cardClassName?: string
  maxWidth?: string
}

export function SinglePricingCard({
  badge,
  title,
  subtitle,
  price,
  benefits,
  features,
  featuresIcon,
  featuresTitle = "Included Features",
  primaryButton,
  secondaryButton,
  testimonials,
  testimonialRotationSpeed = 5000,
  animationEnabled = true,
  className,
  cardClassName,
  maxWidth = "max-w-5xl",
}: SinglePricingCardProps) {
  const sectionRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const [currentTestimonialIndex, setCurrentTestimonialIndex] =
    React.useState(0)

  React.useEffect(() => {
    if (testimonials.length <= 1) return
    const interval = window.setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, testimonialRotationSpeed)
    return () => window.clearInterval(interval)
  }, [testimonials.length, testimonialRotationSpeed])

  return (
    <div
      ref={sectionRef}
      className={`relative overflow-hidden py-12 ${className ?? ""}`}
    >
      <div
        className={`relative z-10 container mx-auto px-4 md:px-6 ${maxWidth}`}
      >
        <motion.div
          initial={animationEnabled ? { opacity: 0, y: 30 } : false}
          animate={
            animationEnabled
              ? isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
              : undefined
          }
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SinglePricingCardContent
            badge={badge}
            title={title}
            subtitle={subtitle}
            price={price}
            benefits={benefits}
            features={features}
            featuresIcon={featuresIcon}
            featuresTitle={featuresTitle}
            primaryButton={primaryButton}
            secondaryButton={secondaryButton}
            testimonials={testimonials}
            currentTestimonialIndex={currentTestimonialIndex}
            isInView={isInView}
            animationEnabled={animationEnabled}
            cardClassName={cardClassName}
          />
        </motion.div>
      </div>
    </div>
  )
}

interface SinglePricingCardContentProps extends Omit<
  SinglePricingCardProps,
  "className" | "maxWidth" | "testimonialRotationSpeed"
> {
  currentTestimonialIndex: number
  isInView: boolean
  cardClassName?: string
}

function SinglePricingCardContent({
  badge,
  title,
  subtitle,
  price,
  benefits,
  features,
  featuresIcon,
  featuresTitle,
  primaryButton,
  secondaryButton,
  testimonials,
  currentTestimonialIndex,
  isInView,
  animationEnabled,
  cardClassName,
}: SinglePricingCardContentProps) {
  const BadgeIcon = badge?.icon
  const FeaturesIcon = featuresIcon
  const PrimaryButtonIcon = primaryButton.icon
  const ChevronIcon = primaryButton.chevronIcon
  const SecondaryButtonIcon = secondaryButton?.icon

  return (
    <Card
      className={`relative overflow-hidden rounded-3xl border-primary/20 bg-card/70 ${cardClassName ?? ""}`}
    >
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col p-6 md:w-1/2 md:p-8">
          {badge && (
            <div className="mb-4 flex items-center">
              <Badge className="border-primary/10 bg-transparent px-3 py-1 text-primary hover:bg-primary/15">
                {BadgeIcon && <BadgeIcon className="mr-1 size-3.5" />}
                <span>{badge.text}</span>
              </Badge>
            </div>
          )}

          <h3 className="mb-2 font-heading text-2xl font-bold text-foreground">
            {title}
          </h3>
          <p className="mb-4 text-foreground/75">{subtitle}</p>

          <div className="mb-6 flex items-baseline">
            <span className="font-heading text-4xl font-bold text-chart-1">
              {price.current}
            </span>
            <div className="flex flex-col md:flex-row">
              {price.original && (
                <span className="ml-2 text-foreground/75">
                  {price.original}
                </span>
              )}
              {price.discount && (
                <Badge
                  variant="outline"
                  className="flex items-center justify-center border-chart-1/40 text-chart-1 md:ml-3"
                >
                  <span>{price.discount}</span>
                </Badge>
              )}
            </div>
          </div>

          <div className="mb-6 space-y-3">
            {benefits.map((benefit) => {
              const BenefitIcon = benefit.icon
              return (
                <div key={benefit.text} className="flex items-center gap-2">
                  <BenefitIcon className="size-4 text-primary" />
                  <span className="text-sm text-foreground/75">
                    {benefit.text}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-auto space-y-3">
            <Button
              className="group w-full gap-2"
              size="lg"
              onClick={primaryButton.onClick}
              asChild={!!primaryButton.href}
            >
              {primaryButton.href ? (
                <Link href="/signup">
                  <PrimaryButtonIcon className="size-4" />
                  <span>{primaryButton.text}</span>
                  {ChevronIcon && (
                    <ChevronIcon className="ml-auto size-4 transition-transform group-hover:translate-x-1" />
                  )}
                </Link>
              ) : (
                <>
                  <PrimaryButtonIcon className="size-4" />
                  <span>{primaryButton.text}</span>
                  {ChevronIcon && (
                    <ChevronIcon className="ml-auto size-4 transition-transform group-hover:translate-x-1" />
                  )}
                </>
              )}
            </Button>

            {secondaryButton && (
              <Button
                variant="outline"
                className="w-full gap-2 border-background/20 bg-transparent text-foreground hover:text-foreground/90"
                size="lg"
                onClick={secondaryButton.onClick}
                asChild={!!secondaryButton.href}
              >
                {secondaryButton.href ? (
                  <Link href={secondaryButton.href}>
                    <span>{secondaryButton.text}</span>
                    {SecondaryButtonIcon && (
                      <SecondaryButtonIcon className="ml-auto size-4" />
                    )}
                  </Link>
                ) : (
                  <>
                    <span>{secondaryButton.text}</span>
                    {SecondaryButtonIcon && (
                      <SecondaryButtonIcon className="ml-auto size-4" />
                    )}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="border-border/50 p-6 md:w-1/2 md:border-l md:p-8">
          <div className="mb-4 flex items-center">
            <h4 className="font-semibold text-foreground">{featuresTitle}</h4>
          </div>

          <div className="mb-6 space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={animationEnabled ? { opacity: 0, x: 20 } : false}
                animate={
                  animationEnabled && isInView
                    ? { opacity: 1, x: 0 }
                    : undefined
                }
                transition={{ delay: 0.35 + index * 0.04, duration: 0.45 }}
                className="flex items-center gap-3"
              >
                <div className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                  <FeaturesIcon className="size-3 text-primary" />
                </div>
                <span className="text-sm text-foreground/75">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>

          {testimonials.length > 0 && (
            <>
              <Separator className="my-6 bg-background/10" />

              <div className="relative min-h-30 overflow-hidden rounded-2xl border border-background/10 p-4">
                <AnimatePresence mode="wait">
                  {testimonials.map(
                    (testimonial, index) =>
                      index === currentTestimonialIndex && (
                        <motion.div
                          key={testimonial.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0 p-4"
                        >
                          <div className="mb-2 flex items-center gap-3">
                            <div className="grid size-8 place-items-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                              {testimonial.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {testimonial.name}
                              </p>
                              <p className="text-xs text-foreground/75">
                                {testimonial.role}
                              </p>
                            </div>
                            <div className="ml-auto flex">
                              {Array.from({ length: testimonial.rating }).map(
                                (_, i) => (
                                  <Star
                                    key={`${testimonial.id}-${i}`}
                                    className="size-3 fill-primary text-primary"
                                  />
                                )
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-foreground/75">
                            {testimonial.content}
                          </p>
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>

              {testimonials.length > 1 && (
                <div className="mt-4 flex justify-center gap-1">
                  {testimonials.map((item, index) => (
                    <button
                      key={item.id}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentTestimonialIndex
                          ? "w-4 bg-primary"
                          : "w-1.5 bg-primary/30"
                      }`}
                      aria-label={`Show testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
