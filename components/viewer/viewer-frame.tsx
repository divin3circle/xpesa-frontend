"use client"

import type { ReactNode } from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useParams } from "next/navigation"
import {
  ArrowUpDown,
  LayoutGrid,
  ListFilter,
  Rows3,
  Search,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "", label: "Overview" },
  { href: "/document", label: "Document" },
  { href: "/link", label: "Link" },
  { href: "/pack", label: "Pack" },
  { href: "/tip", label: "Tip" },
]

export function ViewerFrame({ children }: { children: ReactNode }) {
  const params = useParams<{ tokenId: string }>()
  const pathname = usePathname()
  const tokenId = params?.tokenId ?? ""

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(193_87%_50%/0.16),transparent_36%),radial-gradient(circle_at_top_right,hsl(44_96%_58%/0.09),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.38))]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <header className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/40 shadow-lg shadow-black/5">
          <div className="absolute inset-0">
            <Image
              src="/dashboard.avif"
              alt="Secure viewer banner"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/76 to-background/15" />

          <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge
                  variant="secondary"
                  className="tracking-[0.12em] uppercase"
                >
                  Protected View
                </Badge>
                <Badge
                  variant="outline"
                  className="tracking-[0.12em] uppercase"
                >
                  Token Workspace
                </Badge>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                  Secure content explorer
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                  Browse protected document, link, pack, and tip modes in a
                  high-trust file-browser shell with token-scoped navigation.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="outline" className="font-mono">
                {tokenId}
              </Badge>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-4 rounded-3xl border border-border/60 bg-card/55 p-3 shadow-sm backdrop-blur-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_170px_120px_120px]">
              <div className="flex items-center gap-2 rounded-2xl border bg-background/80 px-3 py-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                Search content
              </div>
              <Button variant="secondary" className="justify-between">
                Show: All files
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button variant="secondary" className="justify-between">
                Sort: Newest
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button variant="secondary" className="justify-between">
                <ListFilter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button size="icon" variant="secondary" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" aria-label="List view">
                <Rows3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <nav className="mt-4 grid gap-2 sm:grid-cols-5">
          {navItems.map((item) => {
            const href = `/view/${tokenId}${item.href}`
            const isActive =
              item.href === ""
                ? pathname === `/view/${tokenId}`
                : pathname.startsWith(href)

            return (
              <Button
                key={item.label}
                asChild
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  "justify-center rounded-2xl",
                  isActive && "shadow-sm"
                )}
              >
                <Link href={href}>{item.label}</Link>
              </Button>
            )
          })}
        </nav>

        <main className="mt-6">{children}</main>
      </div>
    </div>
  )
}
