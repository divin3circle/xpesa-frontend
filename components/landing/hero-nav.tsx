"use client"

import Link from "next/link"
import { BrandLogo } from "@/components/landing/brand-logo"
import { Button } from "@/components/ui/button"
import type { HeroNavItem } from "@/lib/landing/hero-content"
import { MobileMenu } from "./mobile-menu"
import { useRouter } from "next/navigation"
import { onNavigate } from "@/lib/utils"

type HeroNavProps = {
  navItems: HeroNavItem[]
}

export function HeroNav({ navItems }: HeroNavProps) {
  const router = useRouter()
  return (
    <nav
      className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 lg:px-10"
      aria-label="Primary navigation"
    >
      <BrandLogo />

      <div className="hidden items-center gap-8 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-sm font-medium text-background/75 transition-colors hover:text-background"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <Button
        size="lg"
        className="hidden md:flex"
        onClick={() => onNavigate("/login", router)}
      >
        Sign In
      </Button>

      <div className="md:hidden">
        <MobileMenu navItems={navItems} />
      </div>
    </nav>
  )
}
