"use client"

import Image from "next/image"
import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicLink } from "@/hooks/use-public"
import placeholderBanner from "@/public/placeholderBanner.jpg"
import {
  Comment01Icon,
  Share01Icon,
  ThumbsUp,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

function formatUsdc(value: number | null) {
  if (!value || value <= 0) return "Free"

  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function buildTypeLabel(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const engagementItems = [
  {
    id: "like",
    title: "Like",
    icon: ThumbsUp,
    action: () => toast.info("Engagement actions coming soon"),
  },
  {
    id: "comment",
    title: "Comment",
    icon: Comment01Icon,
    action: () => toast.info("Engagement actions coming soon"),
  },
  {
    id: "share",
    title: "Share",
    icon: Share01Icon,
    action: () => toast.info("Engagement actions coming soon"),
  },
]

export function PayLinkPreviewCard() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId

  const { data, isLoading, error } = usePublicLink(linkId)

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col justify-between gap-2 md:flex-row md:items-center">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !data?.link) {
    return (
      <Card className="flex min-h-80 items-center justify-center border-border/70 px-6 text-sm text-muted-foreground">
        Could not load link details.
      </Card>
    )
  }

  const link = data.link

  return (
    <Card className="relative min-h-80 overflow-hidden border-border/70">
      <div className="absolute inset-0">
        <Image
          src={placeholderBanner}
          alt={link.title}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="rounded-3xl border border-border/60 bg-background/45 p-4 backdrop-blur-xl sm:p-5">
          <div className="space-y-2">
            <h2 className="line-clamp-2 text-2xl font-semibold tracking-tight">
              {link.title}
            </h2>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {link.description || "Creator-protected content preview."}
            </p>
          </div>

          <div className="flex flex-col-reverse justify-between pt-4 md:flex-row md:items-center">
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{buildTypeLabel(link.type)}</Badge>
              <Badge variant="secondary">{link.view_count} views</Badge>
              <Badge variant="outline">{formatUsdc(link.price_usdc)}</Badge>
              {link.access_wallet_binding ? (
                <Badge variant="outline">Wallet-bound</Badge>
              ) : null}
              {link.access_max_views ? (
                <Badge variant="outline">
                  Max {link.access_max_views} opens
                </Badge>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {engagementItems.map((item) => (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="group flex w-24 cursor-pointer items-center justify-center gap-1 rounded-2xl bg-background/10 p-2 text-sm text-muted-foreground backdrop-blur-sm"
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    className="size-6 group-hover:text-pink-500"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
