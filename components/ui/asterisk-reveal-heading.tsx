"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

type HeadingTag = "h1" | "h2" | "h3"

type AsteriskRevealHeadingProps = {
  text: string
  as?: HeadingTag
  className?: string
  delayMs?: number
}

export function AsteriskRevealHeading({
  text,
  as = "h2",
  className,
  delayMs = 520,
}: AsteriskRevealHeadingProps) {
  const [showAsterisks, setShowAsterisks] = React.useState(true)
  const characters = React.useMemo(() => Array.from(text), [text])

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => setShowAsterisks(false), delayMs)
    return () => window.clearTimeout(timeoutId)
  }, [delayMs])

  const Tag = as

  return (
    <Tag className={className}>
      <AnimatePresence mode="wait" initial={false}>
        {showAsterisks ? (
          <motion.span
            key="asterisks"
            className="inline whitespace-pre-wrap"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.35 }}
            aria-hidden="true"
          >
            {characters.map((character, index) => {
              if (character === " ") {
                return (
                  <React.Fragment key={`space-${index}`}>
                    {"\u00A0"}
                  </React.Fragment>
                )
              }

              return (
                <span
                  key={`star-${index}`}
                  className="relative inline-block align-baseline leading-none"
                >
                  <span className="invisible">{character}</span>
                  <span
                    className={cn(
                      "absolute inset-0 inline-flex animate-spin items-center justify-center font-heading",
                      index % 2 === 0 ? "text-primary" : "text-chart-1"
                    )}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    *
                  </span>
                </span>
              )
            })}
          </motion.span>
        ) : (
          <motion.span
            key="heading"
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="inline-block"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </Tag>
  )
}
