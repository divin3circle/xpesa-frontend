"use client"

import * as React from "react"
import { FrameIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import {
  footerLinkGroups,
  footerSocialLinks,
} from "@/lib/landing/footer-content"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "../landing/brand-logo"

type StickyFooterProps = React.ComponentProps<"footer">

export function StickyFooter({ className, ...props }: StickyFooterProps) {
  return (
    <footer
      className={cn("relative w-full", className)}
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      {...props}
    >
      <div className="relative bottom-0 md:h-105 h-125 w-full">
        <div className="sticky top-[calc(100vh-620px)] h-full overflow-y-auto">
          <div className="relative flex size-full flex-col justify-between gap-5 px-4 py-8 md:px-12">
            <div
              aria-hidden
              className="absolute inset-0 isolate z-0 contain-strict"
            >
              <div className="absolute top-0 left-0 h-80 w-80 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.845_0.143_164.978/.2),transparent_70%)]" />
              <div className="absolute right-0 bottom-0 h-72 w-72 translate-y-1/3 rounded-full bg-[radial-gradient(circle,oklch(0.508_0.118_165.612/.14),transparent_70%)]" />
            </div>

            <div className="z-10 mt-8 flex flex-col gap-8 md:flex-row xl:mt-0">
              <AnimatedContainer className="w-full max-w-sm min-w-2xs space-y-4">
                <BrandLogo />
                <p className="mt-8 text-sm text-background/75 md:mt-0">
                  xpesa helps creators in Africa monetize links and tips, then
                  withdraw earnings to local mobile money rails like M-Pesa.
                </p>
                <div className="flex gap-2">
                  {footerSocialLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Button
                        key={link.title}
                        size="icon"
                        variant="ghost"
                        className="size-12"
                        asChild
                      >
                        <a
                          href={link.href}
                          aria-label={link.title}
                          className="text-background/75 transition-all duration-300 hover:text-background"
                        >
                          <Icon className="size-6d" />
                        </a>
                      </Button>
                    )
                  })}
                </div>
              </AnimatedContainer>

              {footerLinkGroups.map((group, index) => (
                <AnimatedContainer
                  key={group.label}
                  delay={0.12 + index * 0.08}
                  className="w-full"
                >
                  <div className="mb-10 md:mb-0">
                    <h3 className="text-sm text-background font-semibold uppercase">
                      {group.label}
                    </h3>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-xs lg:text-sm">
                      {group.links.map((link) => {
                        const Icon = link.icon
                        return (
                          <li key={link.title}>
                            <a
                              href={link.href}
                              className="inline-flex items-center text-background/50 transition-all duration-300 hover:text-background"
                            >
                              {Icon && <Icon className="me-1 size-4" />}
                              {link.title}
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </AnimatedContainer>
              ))}
            </div>

            <div className="z-10 flex flex-col items-center justify-between gap-2 pt-3 text-sm text-muted-foreground md:flex-row">
              <p className="font-heading text-xs font-semibold text-background/50">
                © 2026 xpesa. All rights reserved.
              </p>
              <p className="font-heading text-xs font-semibold text-background/50">
                Built for creator monetization in Africa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
  children?: React.ReactNode
  delay?: number
}

function AnimatedContainer({
  delay = 0.1,
  children,
  ...props
}: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={props.className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", y: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
