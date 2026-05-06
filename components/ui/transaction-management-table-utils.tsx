"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

export function AssetLogoBadge({
  src,
  label,
  size = 20,
  className,
}: {
  src: string | null | undefined
  label: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full border border-border/60 bg-background",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
    >
      {src ? (
        <Image
          src={src}
          alt={label}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[10px] font-semibold text-muted-foreground">
          {label.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
  )
}

export default AssetLogoBadge
