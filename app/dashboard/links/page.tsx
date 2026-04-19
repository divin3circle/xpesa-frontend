"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useMyLinks, type Link as LinkRecord } from "@/hooks/use-links"
import { Skeleton } from "@/components/ui/skeleton"

type LinkType = "gate" | "document" | "pack" | "tip"

type LinkItem = {
  id: string
  title: string
  type: LinkType
  price: string
  stats: string
  active: boolean
  pageCount?: number
  fileSizeBytes?: number
  fileCount?: number
  packBreakdown?: string
  totalSizeBytes?: number
}

const filterTabs = [
  "All",
  "Gate Links",
  "Documents",
  "File Packs",
  "Tips",
  "Inactive",
] as const

type FilterTab = (typeof filterTabs)[number]

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return null
  return `${amount.toFixed(2)} USDC`
}

function toLinkItem(link: LinkRecord): LinkItem {
  const priceLabel =
    link.type === "tip"
      ? (formatCurrency(link.suggested_amount_usdc) ?? "Any")
      : (formatCurrency(link.price_usdc) ?? "Free")

  return {
    id: link.id,
    title: link.title,
    type: link.type as LinkType,
    price: priceLabel,
    stats: `${link.view_count} views • ${link.payment_count} payments • ${formatCurrency(link.total_earned_usdc) ?? "0.00 USDC"} earned`,
    active: link.is_active,
    pageCount: link.document_page_count ?? undefined,
    fileSizeBytes: link.document_file_size_bytes ?? undefined,
    fileCount: link.pack_file_count ?? undefined,
    totalSizeBytes: link.pack_total_size_bytes ?? undefined,
  }
}

function resolveTypeBadge(linkType: LinkType) {
  if (linkType === "gate") {
    return {
      label: "GATE",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    }
  }

  if (linkType === "document") {
    return {
      label: "DOC",
      className:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    }
  }

  if (linkType === "pack") {
    return {
      label: "PACK",
      className:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    }
  }

  return {
    label: "TIP",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  }
}

const LinkSkeleton = () => (
  <div className="w-full rounded-2xl border p-4">
    <div className="my-2 flex items-center justify-between">
      <Skeleton className="h-4 w-1/3" />
      <div className="flex w-1/2 items-center justify-between gap-1 md:w-1/3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
    <div className="my-2 flex w-full items-center justify-between gap-1 md:w-1/3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-1/3" />
    </div>
    <Skeleton className="mt-4 h-5 w-1/2" />
  </div>
)

export default function LinksPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All")
  const { data, isLoading, error } = useMyLinks()

  const links = useMemo(() => (data?.links ?? []).map(toLinkItem), [data])

  const filteredLinks = useMemo(() => {
    if (activeFilter === "All") return links
    if (activeFilter === "Inactive") return links.filter((item) => !item.active)
    if (activeFilter === "Gate Links")
      return links.filter((item) => item.type === "gate")
    if (activeFilter === "Documents")
      return links.filter((item) => item.type === "document")
    if (activeFilter === "File Packs")
      return links.filter((item) => item.type === "pack")
    return links.filter((item) => item.type === "tip")
  }, [activeFilter, links])

  const emptyStateMessage =
    activeFilter === "All"
      ? "You have not created any links yet."
      : `No ${activeFilter.toLowerCase()} found.`

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            My links
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, publish, and manage gate links, documents, file packs, and
            tips.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/links/create">Create new link</Link>
        </Button>
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
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <LinkSkeleton key={index} />
          ))
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-sm text-destructive">
              Could not load your links. Please try again.
            </CardContent>
          </Card>
        ) : filteredLinks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              {emptyStateMessage}
            </CardContent>
          </Card>
        ) : (
          filteredLinks.map((item) => {
            const typeBadge = resolveTypeBadge(item.type)

            return (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription>{item.stats}</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={typeBadge.className}>
                        {typeBadge.label}
                      </Badge>
                      <Badge>{item.price}</Badge>
                      <Badge variant={item.active ? "default" : "secondary"}>
                        {item.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.type === "document" &&
                    item.pageCount &&
                    item.fileSizeBytes && (
                      <p className="text-sm text-muted-foreground">
                        {item.pageCount} pages •{" "}
                        {formatBytes(item.fileSizeBytes)}
                      </p>
                    )}
                  {item.type === "pack" && (
                    <p className="text-sm text-muted-foreground">
                      {item.fileCount} files • {item.packBreakdown} •{" "}
                      {formatBytes(item.totalSizeBytes ?? 0)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary">
                      Copy link
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      Toggle status
                    </Button>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </section>
    </div>
  )
}
