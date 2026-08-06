"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface SegmentedProgressProps {
  /** Target fill, 0–100. */
  value: number
  segments?: number
  label?: string
  showPercentage?: boolean
  className?: string
}

export function SegmentedProgress({
  value,
  segments = 20,
  label,
  showPercentage = false,
  className,
}: SegmentedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  // Animate 0 → value on mount with a cubic ease-out.
  useEffect(() => {
    const duration = 900
    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayValue(from + (value - from) * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  const filled = Math.round((displayValue / 100) * segments)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label || showPercentage ? (
        <div className="flex items-center justify-between">
          {label ? (
            <span className="text-sm font-medium tracking-wide text-muted-foreground">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showPercentage ? (
            <span className="text-sm font-semibold tracking-tight text-foreground tabular-nums">
              {Math.round(displayValue)}%
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        className="flex gap-[3px] py-1"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-3 flex-1 origin-center rounded-[4px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              index < filled ? "bg-primary" : "bg-muted/60"
            )}
            style={{ transitionDelay: `${index * 25}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
