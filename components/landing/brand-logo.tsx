import xpesaLogo from "@/public/logo.png"
import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  tone?: "light" | "default"
}

export function BrandLogo({ tone = "light" }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-2" aria-label="xpesa home">
      <Image
        src={xpesaLogo}
        alt="xpesa logo"
        className="size-7 animate-spin rounded-md"
      />

      <span
        className={cn(
          "font-heading text-2xl font-extrabold tracking-tight",
          tone === "light" ? "text-background" : "text-foreground"
        )}
      >
        xpesa
      </span>
    </div>
  )
}
