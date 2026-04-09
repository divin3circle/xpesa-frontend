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

type LinkType = "gate" | "document" | "pack" | "tip"

type LinkItem = {
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

const links: LinkItem[] = [
  {
    title: "React Native Crash Course",
    type: "gate",
    price: "$12",
    stats: "245 views • 33 payments • $396 earned",
    active: true,
  },
  {
    title: "Design teardown notes",
    type: "document",
    price: "$4",
    stats: "112 views • 19 payments • $76 earned",
    active: true,
    pageCount: 24,
    fileSizeBytes: 5242880,
  },
  {
    title: "KCSE Revision Bundle",
    type: "pack",
    price: "$16",
    stats: "88 views • 14 payments • $224 earned",
    active: true,
    fileCount: 3,
    packBreakdown: "2 PDF • 1 Image",
    totalSizeBytes: 12163481,
  },
  {
    title: "Buy me chai",
    type: "tip",
    price: "Any",
    stats: "62 views • 21 tips • $48 earned",
    active: false,
  },
]

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

export default function LinksPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All")

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
  }, [activeFilter])

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
        {filteredLinks.map((item) => {
          const typeBadge = resolveTypeBadge(item.type)

          return (
            <Card key={item.title}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription>{item.stats}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
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
                      {item.pageCount} pages • {formatBytes(item.fileSizeBytes)}
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
        })}
      </section>
    </div>
  )
}
