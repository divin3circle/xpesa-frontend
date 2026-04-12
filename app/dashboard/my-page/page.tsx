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
import { useUserDetails } from "@/hooks/use-user";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { envConfig } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const activeLinks = [
  { title: "React Native Crash Course", type: "GATE", price: "$12" },
  { title: "Buy me chai", type: "TIP", price: "Any amount" },
  { title: "Design teardown notes", type: "GATE", price: "$4" },
]

export default function MyPagePage() {
  const { data, isLoading, error } = useUserDetails();
  const router = useRouter();


  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center flex-col">
        <h1 className="text-muted-foreground font-sans text-xs mb-4">Just a moment..</h1>
        <LoadingSpinner />
      </div>
    )
  }

  if (!data?.creator || error) {
    router.push(`/error?q=${error?.message || "An unexpected error occurred"}`)
    return;
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
          This is the page your audience sees at xpesa.com/{data.creator.handle}.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl border-none bg-transparent shadow-none lg:col-span-3">
          <CardContent className="space-y-4">
            <div className="rounded-xl border p-6">
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
                      className="h-8 w-8 rounded-2xl object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium">{data.creator.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{data.creator.handle}</p>
                </div>
              </div>
              <p className="mb-4 truncate max-w-full text-sm text-muted-foreground">
                {data.creator.bio}
              </p>
              <div className="space-y-2">
                {activeLinks.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type}
                      </p>
                    </div>
                    <Badge>{item.price}</Badge>
                  </div>
                ))}
              </div>
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
              <p className="font-medium">xpesa.com/{data.creator.handle}</p>
              <p className="text-xs text-muted-foreground">
                Public URL for your audience
              </p>
            </div>
            <Button className="w-full">Copy page link</Button>
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
