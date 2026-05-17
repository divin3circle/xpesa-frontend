import Image from "next/image"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { CreatorPublicProfile } from "@/app/api/public/creator/[handle]/route"
import { getUserAvatarURL } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { BadgeCheck } from "@hugeicons/core-free-icons"

type CreatorHeroCardProps = {
  creator: CreatorPublicProfile
}

export function CreatorHeroCard({ creator }: CreatorHeroCardProps) {
  return (
    <Card className="relative min-h-90 overflow-hidden border-border/70">
      <div className="absolute inset-0">
        <Image
          src="/dashboard.avif"
          alt="Creator profile banner"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-background via-background/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="rounded-3xl border border-border/60 bg-background/45 p-4 backdrop-blur-xl sm:p-5">
          <div className="flex items-end gap-2">
            <Avatar className="size-20 h-20 w-20 border sm:size-20" size="lg">
              <AvatarImage
                src={getUserAvatarURL(creator.avatar_url)}
                alt={creator.display_name}
                width={500}
                height={500}
                className=""
              />
              <AvatarFallback>
                {creator.display_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="pb-1">
              <h1 className="font-heading text-xl leading-none font-semibold sm:text-2xl">
                {creator.display_name}
              </h1>
              <p className="text-sm text-muted-foreground">@{creator.handle}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm. max-w-2xl leading-relaxed text-muted-foreground">
              {creator.bio?.trim() ||
                "Creator has not added a profile bio yet."}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                Verified
                <HugeiconsIcon
                  icon={BadgeCheck}
                  size={14}
                  className="ml-0.5 text-chart-1"
                />
              </Badge>
              <Badge variant="outline">Active Creator</Badge>
              <Badge variant="outline">Wallet Ready</Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
