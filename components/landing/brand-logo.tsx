import xpesaLogo from "@/public/logo.png"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Link from "next/link"

type BrandLogoProps = {
  tone?: "light" | "default"
}

export function BrandLogo({ tone = "light" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2"
      aria-label="xpesa home"
    >
      <Image
        src={xpesaLogo}
        alt="xpesa logo"
        className="size-7 animate-[spin_3s_linear_infinite] rounded-md group-hover:animate-none"
      />

      <span
        className={cn(
          "font-heading text-2xl font-extrabold tracking-tight",
          tone === "light" ? "text-white" : "text-foreground"
        )}
      >
        xpesa
      </span>
    </Link>
  )
}
