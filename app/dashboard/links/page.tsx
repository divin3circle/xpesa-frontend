"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { LinkCard } from "@/components/dashboard/links/link-card"
import { LinkListMessage, LinkSkeleton } from "@/components/dashboard/links/link-list-states"
import { toLinkItem } from "@/components/dashboard/links/link-list-model"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMyLinks } from "@/hooks/use-links"

const filterTabs = [
  "All",
  "Gate Links",
  "Documents",
  "File Packs",
  "Tips",
  "Pending",
  "Rejected",
  "Inactive",
] as const

type FilterTab = (typeof filterTabs)[number]

function filterLinks(tab: FilterTab, links: ReturnType<typeof toLinkItem>[]) {
  if (tab === "All") return links
  if (tab === "Inactive") return links.filter((item) => !item.active)
  if (tab === "Pending") {
    return links.filter((item) => item.moderationStatus !== "approved")
  }
  if (tab === "Rejected") {
    return links.filter((item) => item.moderationStatus === "rejected")
  }
  if (tab === "Gate Links") return links.filter((item) => item.type === "gate")
  if (tab === "Documents") return links.filter((item) => item.type === "document")
  if (tab === "File Packs") return links.filter((item) => item.type === "pack")
  return links.filter((item) => item.type === "tip")
}

export default function LinksPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All")
  const { data, isLoading, error } = useMyLinks()
  const links = useMemo(() => (data?.links ?? []).map(toLinkItem), [data])
  const filteredLinks = useMemo(
    () => filterLinks(activeFilter, links),
    [activeFilter, links]
  )
  const emptyState =
    activeFilter === "All"
      ? "You have not created any links yet."
      : `No ${activeFilter.toLowerCase()} found.`

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">My links</h1>
          <p className="text-sm text-muted-foreground">
            Create, publish, and manage gate links, documents, file packs, and tips.
          </p>
        </div>
        <Button asChild><Link href="/dashboard/links/create">Create new link</Link></Button>
      </section>

      <section className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <Badge
            key={tab}
            className="cursor-pointer px-3 py-1"
            variant={activeFilter === tab ? "default" : "secondary"}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </Badge>
        ))}
      </section>

      <section className="grid gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, index) => (
          <LinkSkeleton key={index} />
        )) : error ? (
          <LinkListMessage danger>Could not load your links. Please try again.</LinkListMessage>
        ) : filteredLinks.length === 0 ? (
          <LinkListMessage>{emptyState}</LinkListMessage>
        ) : filteredLinks.map((item) => <LinkCard key={item.id} item={item} />)}
      </section>
    </div>
  )
}
