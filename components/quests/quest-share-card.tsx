"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Copy, Link2, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { envConfig } from "@/lib/env"

const cardBase = "rounded-2xl border border-border/70 bg-transparent shadow-none"

/** thumbnail_url is stored as a storage key (e.g. "xpesa-public/thumbnails/...") — resolve to a URL. */
function resolveThumbnail(value?: string | null) {
  if (!value) return null
  if (value.startsWith("http") || value.startsWith("/")) return value
  return envConfig.AVATARS_URL + value
}

export function QuestShareCard({
  questId,
  linkId,
  title,
  thumbnailUrl,
}: {
  questId: string
  linkId: string
  title: string
  thumbnailUrl?: string | null
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const contentUrl = `${origin}/pay/${linkId}`
  const leaderboardUrl = `${origin}/quest/${questId}/leaderboard`
  const thumbnail = resolveThumbnail(thumbnailUrl)

  return (
    <Card className={cardBase}>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Share</CardTitle>
        <CardDescription>
          Publish these links to send people to your quest and its leaderboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CopyRow label="Quest link" icon={<Link2 className="size-4" />} value={contentUrl} />
        <CopyRow
          label="Leaderboard link"
          icon={<Trophy className="size-4" />}
          value={leaderboardUrl}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Link preview</p>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="relative aspect-[16/7] bg-muted">
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt={title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  No thumbnail
                </div>
              )}
            </div>
            <div className="space-y-1 p-3">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Xpesa · Creator quest
              </p>
              <p className="font-heading font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">
                Unlock the content, then climb the leaderboard.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CopyRow({
  label,
  icon,
  value,
}: {
  label: string
  icon: React.ReactNode
  value: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        {icon}
        {label}
      </p>
      <div className="flex items-center gap-2">
        <Input readOnly value={value} className="font-mono text-xs" />
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? (
            <>
              <Check className="size-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-4" /> Copy
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
