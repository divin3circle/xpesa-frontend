"use client"
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
import { useUserDetails } from "@/hooks/use-user"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { envConfig } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Checkmark } from "@hugeicons/core-free-icons"
import { useMyLinks } from "@/hooks/use-links"

export default function MyPagePage() {
  const { data, isLoading, error } = useUserDetails()
  const [copied, setCopied] = useState(false)
  const {
    data: myLinksData,
    isLoading: isMyLinksLoading,
    error: myLinksError,
  } = useMyLinks()

  // const router = useRouter()

  // if (!isLoading && (!data?.creator || error)) {
  //   console.error("Error fetching user details:", error)
  //   router.push(`/error?q=${error?.message || "Ano unexpected error occurred"}`)
  // }

  // if (!isMyLinksLoading && (!myLinksData || myLinksError)) {
  //   console.error("Error fetching my links:", myLinksError)
  //   router.push(
  //     `/error?q=${myLinksError?.message || "An unexpected error occurred"}`
  //   )
  // }

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="mb-4 font-sans text-xs text-muted-foreground">
          Just a moment..
        </h1>
        <LoadingSpinner />
      </div>
    )
  }

  if (!data?.creator || error || !myLinksData || myLinksError) {
    return null
  }

  const avatarURL =
    !data || error
      ? "/logo.png"
      : envConfig.AVATARS_URL + data.creator?.avatar_url || "/logo.png"

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Preview creator page
        </h1>
        <p className="text-sm text-muted-foreground">
          This is the page your audience sees at xpesa.com/{data.creator.handle}
          .
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl border-none bg-transparent shadow-none lg:col-span-3">
          <CardContent className="space-y-4">
            <div className="rounded-2xl border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="">
                  {isLoading ? (
                    <Skeleton className="h-8 w-8 rounded-full" />
                  ) : (
                    <Image
                      src={avatarURL}
                      alt="Avatar"
                      width={100}
                      height={100}
                      className="size-15 rounded-full border object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium">{data.creator.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{data.creator.handle}
                  </p>
                </div>
              </div>
              <p className="mb-4 max-w-full truncate text-sm text-muted-foreground">
                {data.creator.bio}
              </p>
              <div className="space-y-2">
                {!isMyLinksLoading &&
                  myLinksData?.links.slice(0, 3).map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-2xl border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {item.type}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Badge>
                          <span>{item.price_usdc ? "$" : ""}</span>
                          {item.price_usdc?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || "Price not set"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                {isMyLinksLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      className="flex items-start justify-between rounded-2xl border border-border/50 p-4"
                      key={index}
                    >
                      <div className="">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="mt-1 h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
              </div>
              <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
                Showing 3 of {myLinksData?.links.length || 0} links
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-transparent shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Share</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Share your creator page link and manage your content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border p-3 text-sm">
              <p className="font-medium">
                xpesa.com/creator/{data.creator.handle}
              </p>
              <p className="text-xs text-muted-foreground">
                Public URL for your audience
              </p>
            </div>
            <Button
              className="w-full"
              disabled={copied}
              onClick={() => {
                setCopied(true)
                navigator.clipboard.writeText(
                  `${envConfig.APP_URL}/creator/${data?.creator?.handle || ""}`
                )
              }}
            >
              {copied ? (
                <span className="flex items-center justify-center gap-1">
                  <HugeiconsIcon
                    icon={Checkmark}
                    className="size-4 text-green-500"
                  />
                  Link copied!
                </span>
              ) : (
                "Copy creator page link"
              )}
            </Button>
            <Button variant="secondary" asChild className="w-full">
              <Link href="/dashboard/profile">Edit profile content</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/links/create">Create another link</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
