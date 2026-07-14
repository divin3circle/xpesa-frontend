"use client"

import Image from "next/image"

import type { CreatorQuestDetail } from "@/hooks/use-quests"
import { envConfig } from "@/lib/env"

function formatBytes(bytes?: number | null) {
  if (!bytes) return "Not set"
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function QuestContentSummary({
  link,
}: {
  link: CreatorQuestDetail["link"]
}) {
  if (!link) return null

  const price = Number(link.price_usdc ?? link.suggested_amount_usdc ?? 0)
  const thumbnailUrl = link.thumbnail_url
    ? envConfig.AVATARS_URL + link.thumbnail_url
    : null

  return (
    <section className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[160px_1fr]">
      <div className="relative aspect-video overflow-hidden rounded-2xl md:aspect-square">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={link.title}
            fill
            className="rounded-2xl border border-accent object-cover shadow shadow-chart-1"
            unoptimized
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">
            No thumbnail
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold">{link.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {link.description}
          </p>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <Info label="Type" value={link.type} />
          <Info
            label="Price"
            value={price > 0 ? `${price.toFixed(2)} USDC` : "Free"}
          />
          <Info
            label="Size"
            value={formatBytes(
              link.pack_total_size_bytes ?? link.document_file_size_bytes
            )}
          />
        </div>
      </div>
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-foreground/5 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground capitalize">{value}</p>
    </div>
  )
}
