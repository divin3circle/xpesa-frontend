import type { ReactNode } from "react"

import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ViewerHeroCardProps = {
  title: string
  description: string
  badges: string[]
  footer?: ReactNode
  className?: string
}

export function ViewerHeroCard({
  title,
  description,
  badges,
  footer,
  className,
}: ViewerHeroCardProps) {
  return (
    <Card
      className={cn(
        "relative min-h-80 overflow-hidden border-border/70",
        className
      )}
    >
      <div className="absolute inset-0">
        <Image
          src="/dashboard.avif"
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="rounded-3xl border border-border/60 bg-background/45 p-4 backdrop-blur-xl sm:p-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>

          {footer ? <div className="mt-4">{footer}</div> : null}
        </div>
      </div>
    </Card>
  )
}
