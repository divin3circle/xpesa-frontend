"use client"

import { useParams } from "next/navigation"
import { usePublicLink } from "@/hooks/use-public"
import Image from "next/image"
import dummyThumbnail from "@/public/dashboard.avif"
import { Skeleton } from "../ui/skeleton"
import { getReadableDateTime } from "@/lib/utils"

export default function PayPreview() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId

  const { data, isLoading } = usePublicLink(linkId)

  if (isLoading) {
    return (
      <div className="my-8">
        <h1 className="font-heading text-xl font-semibold">Content Preview</h1>
        <p className="font-sans text-sm text-muted-foreground">
          Get a preview of the content behind this link.
        </p>

        <div className="mt-2 flex h-64 flex-col gap-2 md:flex-row md:items-center">
          <Skeleton className="h-full w-full md:w-3/4" />
          <Skeleton className="h-full w-full md:w-1/4" />
        </div>
      </div>
    )
  }
  return (
    <div className="my-16">
      <h1 className="font-heading text-xl font-semibold">Content Preview</h1>
      <p className="font-sans text-sm text-muted-foreground">
        Get a preview of the content behind this link.
      </p>
      <div className="mt-2 flex w-full flex-col gap-4 md:flex-row md:items-start">
        <div className="rounded-3xl border border-foreground/5 bg-background/10 p-2 md:w-2/3">
          <Image
            src={dummyThumbnail}
            alt="content thumbnail"
            height={1000}
            width={1000}
            className="rounded-3xl"
            priority
          />
        </div>
        <div className="flex w-full flex-col gap-2 py-4 md:w-1/3">
          <div className="flex items-center justify-between border-b border-dashed border-muted-foreground py-4">
            <h1 className="font-semibold text-muted-foreground">
              Content Type
            </h1>
            <p className="uppercase">{data?.link.type}</p>
          </div>
          <div className="flex items-center justify-between border-b border-dashed border-muted-foreground py-4">
            <h1 className="font-semibold text-muted-foreground">
              Content Price
            </h1>
            <p className="">
              {data?.link.price_usdc ? "$" : ""}
              {data?.link.price_usdc || "Any Amount"}
            </p>
          </div>
          <div className="flex items-center justify-between border-b border-dashed border-muted-foreground py-4">
            <h1 className="font-semibold text-muted-foreground">
              Release Date
            </h1>
            <p className="">
              {getReadableDateTime("full", data?.link.created_at)}
            </p>
          </div>
          <div className="flex items-center justify-between border-b border-dashed border-muted-foreground py-4">
            <h1 className="font-semibold text-muted-foreground">Links</h1>
            <p className="">{data?.link.type === "gate" ? 1 : 0}</p>
          </div>
          <div className="flex items-center justify-between border-b border-dashed border-muted-foreground py-4">
            <h1 className="font-semibold text-muted-foreground">Documents</h1>
            <p className="">
              {data?.link.type === "document"
                ? 1
                : data?.link.type === "pack"
                  ? data.link.pack_file_count
                  : 0}
            </p>
          </div>
          <div className="py-4">
            <h1 className="font-semibold text-muted-foreground">Description</h1>
            <p className="leading-relaxed">{data?.link.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
