import { LinkPublic } from "@/app/api/public/creator/[handle]/route"
import Image from "next/image"
import { envConfig } from "@/lib/env"
import { getLinkImageURL } from "@/lib/link-assets"
import { Button } from "@/components/ui/button"
import { ArrowRight01Icon } from "hugeicons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTransactionsByLinkId } from "@/hooks/use-transactions"
import LoadingSpinner from "@/components/ui/loading-spinner"

function formatUSDC(value: number | null) {
  if (!value || value <= 0) return "Free"

  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export default function CreatorLinkCard({ link }: {
  link: LinkPublic
}) {
  const { data, isLoading } = useTransactionsByLinkId(link.id, 10)
  const router = useRouter()

  const thumbnailURL = link.thumbnail_url
    ? envConfig.AVATARS_URL + link.thumbnail_url
    : getLinkImageURL(link.type)

  return (
    <Card key={link.id} className="overflow-hidden border-border/70">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={thumbnailURL}
          alt={link.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <CardContent className="space-y-2 p-4">
        <p className="line-clamp-2 truncate font-medium">{link.title}</p>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{formatType(link.type)}</Badge>
          <Badge variant="secondary">{formatUSDC(link.price_usdc)}</Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{(link.view_count ?? 0).toLocaleString()} views</span>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <span>
              {(data?.transactions.length ?? 0).toLocaleString()} sales
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          className="group mt-4 w-full"
          onClick={() => router.push(`/pay/${link.id}`)}
        >
          See details
          <ArrowRight01Icon className="size-4 duration-500 ease-in-out group-hover:translate-x-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}
