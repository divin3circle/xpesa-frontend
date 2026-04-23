"use client"

import { useParams } from "next/navigation"
import { usePublicLink } from "@/hooks/use-public"
import Image from "next/image";
import dummyThumbnail from "@/public/dashboard.avif";
import { Skeleton } from "../ui/skeleton";
import { getReadableDateTime } from "@/lib/utils";

export default function PayPreview() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId

  const { data, isLoading, error } = usePublicLink(linkId)

  if (isLoading) {
    return (
      <div className="my-8">
        <h1 className="font-semibold text-xl font-heading">Content Preview</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Get a preview of the content behind this link.
        </p>

        <div className="h-64 flex flex-col mt-2 md:flex-row md:items-center gap-2">
          <Skeleton className="w-full md:w-3/4 h-full" />
          <Skeleton className="w-full md:w-1/4 h-full" />
        </div>
      </div>

    )
  }
  return (
    <div className="my-16">
      <h1 className="font-semibold text-xl font-heading">Content Preview</h1>
      <p className="text-sm text-muted-foreground font-sans">
        Get a preview of the content behind this link.
      </p>
      <div className="flex flex-col w-full mt-2 md:flex-row md:items-start gap-4">
        <div className="rounded-3xl md:w-2/3 p-2 bg-background/10 border border-foreground/5">
          <Image src={dummyThumbnail} alt="content thumbnail" height={1000} width={1000} className="rounded-3xl" priority />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3 py-4">
          <div className="flex items-center justify-between py-4 border-b border-muted-foreground border-dashed">
            <h1 className="text-muted-foreground font-semibold">Content Type</h1>
            <p className="uppercase">{data?.link.type}</p>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-muted-foreground border-dashed">
            <h1 className="text-muted-foreground font-semibold">Content Price</h1>
            <p className="">
              {data?.link.price_usdc ? "$" : ""}
              {data?.link.price_usdc || "Any Amount"}</p>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-muted-foreground border-dashed">
            <h1 className="text-muted-foreground font-semibold">Release Date</h1>
            <p className="">{getReadableDateTime("full", data?.link.created_at)}</p>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-muted-foreground border-dashed">
            <h1 className="text-muted-foreground font-semibold">Links</h1>
            <p className="">{data?.link.type === "gate" ? 1 : 0}</p>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-muted-foreground border-dashed">
            <h1 className="text-muted-foreground font-semibold">Documents</h1>
            <p className="">{data?.link.type === "document" ? 1 : data?.link.type === "pack" ? data.link.pack_file_count : 0}</p>
          </div>
          <div className="py-4 border-b border-muted-foreground border-dashed">
            <h1 className="text-muted-foreground font-semibold">Description</h1>
            <p className="leading-relaxed">{data?.link.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
