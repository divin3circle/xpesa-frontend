"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import type { HeroNavItem } from "@/lib/landing/hero-content"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { BrandLogo } from "./brand-logo"
import { MenuIcon } from "lucide-react"

type MobileMenuProps = {
  navItems: HeroNavItem[]
}

export function MobileMenu({ navItems }: MobileMenuProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="border border-white/20 bg-white/10 text-background hover:bg-white/20"
          aria-label="Open menu"
        >
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="">
        <DrawerHeader className="">
          <DrawerTitle>
            <BrandLogo tone="default" />
          </DrawerTitle>
          <DrawerDescription className="text-left font-sans text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            A creator tools platform
          </DrawerDescription>
          <div className="flex w-full flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </DrawerHeader>
        <DrawerFooter>
          <Button size="lg">Join creator waitlist</Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Get Started
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
