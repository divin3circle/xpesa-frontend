"use client"


import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import type { LinkPublic } from "@/app/api/public/creator/[handle]/route"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import CreatorLinkCard from "../CreatorLinkCard"

type CreatorLinksGridProps = {
  links: LinkPublic[]
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
            <CreatorLinkCard link={link} key={link.id} />
          ))}
        </div>
      )}
    </section>
  )
}
