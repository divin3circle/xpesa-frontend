"use client"

import Image from "next/image"
import { Award } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { QuestNftArtUpload } from "@/components/quests/quest-nft-art-upload"

export type QuestNftDraft = {
  enabled: boolean
  name: string
  description: string
  imageUrl: string
  imageR2Key: string
}

export function QuestNftRewardCard({
  questId,
  value,
  onChange,
}: {
  questId: string
  value: QuestNftDraft
  onChange: (value: QuestNftDraft) => void
}) {
  return (
    <section className="rounded-2xl border bg-background p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-foreground text-background">
            <Award className="size-5" />
          </div>
          <div>
            <p className="font-medium">Completion NFT</p>
            <p className="text-sm text-muted-foreground">
              Let submitted participants claim a quest badge.
            </p>
          </div>
        </div>
        <Switch
          checked={value.enabled}
          onCheckedChange={(enabled) => onChange({ ...value, enabled })}
        />
      </div>
      {value.enabled && (
        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
            {value.imageUrl ? (
              <Image
                src={value.imageUrl}
                alt={value.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-xs text-muted-foreground">
                No artwork
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Input
              value={value.name}
              onChange={(event) =>
                onChange({ ...value, name: event.target.value })
              }
              placeholder="NFT name"
            />
            <Textarea
              value={value.description}
              onChange={(event) =>
                onChange({ ...value, description: event.target.value })
              }
              placeholder="NFT description"
              rows={3}
            />
            <QuestNftArtUpload
              questId={questId}
              onUploaded={(imageUrl, imageR2Key) =>
                onChange({ ...value, imageUrl, imageR2Key })
              }
            />
            {value.imageUrl && (
              <p className="text-xs text-muted-foreground">
                Click Next to save this NFT reward before participants can claim it.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
