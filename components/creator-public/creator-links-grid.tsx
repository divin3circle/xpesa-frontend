"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import type { LinkPublic } from "@/app/api/public/creator/[handle]/route"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getLinkImageURL } from "@/lib/utils"
import router from "next/router"
import { Button } from "../ui/button"
import { ArrowRight01Icon } from "hugeicons-react"

type CreatorLinksGridProps = {
  links: LinkPublic[]
}

function formatUsdc(value: number | null) {
  if (!value || value <= 0) return "Free"

  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function CreatorLinksGrid({ links }: CreatorLinksGridProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLinks = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) return links

    return links.filter((link) => {
      const titleMatch = link.title.toLowerCase().includes(normalized)
      const typeMatch = link.type.toLowerCase().includes(normalized)
      return titleMatch || typeMatch
    })
  }, [links, searchTerm])

  return (
    <section className="space-y-4">
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Creator Highlights
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing {filteredLinks.length} of {links.length} content items
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search content"
            className="pl-9"
          />
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <Card className="border-border/70">
          <CardContent className="p-8 text-center text-muted-foreground">
            No content available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredLinks.map((link) => (
            <Card
              key={link.id}
              className="overflow-hidden border-border/70 backdrop-blur-2xl"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={getLinkImageURL(link.type)}
                  alt={link.title}
                  fill
                  className="object-cover"
                />
              </div>

              <CardContent className="space-y-2 p-4">
                <p className="line-clamp-2 truncate font-medium">
                  {link.title}
                </p>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">{formatType(link.type)}</Badge>
                  <Badge variant="secondary">
                    {formatUsdc(link.price_usdc)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{(link.view_count ?? 0).toLocaleString()} views</span>
                  <span>
                    {(link.payment_count ?? 0).toLocaleString()} sales
                  </span>
                </div>
                <Button
                  variant="ghost"
                  className="group mt-4 w-full"
                  onClick={() => router.back()}
                >
                  See details
                  <ArrowRight01Icon className="size-4 duration-500 ease-in-out group-hover:translate-x-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
