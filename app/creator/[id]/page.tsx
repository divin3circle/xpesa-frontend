"use client"

import { CreatorProfileView } from "@/components/creator-public/creator-profile-view"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { usePublicCreator } from "@/hooks/use-public"
import { use } from "react"
import Image from "next/image"

interface CreatorPageProps {
  params: Promise<{ id: string }>
}

export default function CreatorPage({ params }: CreatorPageProps) {
  const { id: creatorHandle } = use(params)
  const { data, isLoading, error } = usePublicCreator(creatorHandle)

  if (isLoading)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <h1 className="mb-2 font-sans text-xs font-semibold text-muted-foreground">
          Just a moment..
        </h1>
        <LoadingSpinner />
      </div>
    )
  if (error)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center text-red-500">
        <Image
          src="/error.png"
          alt="Error"
          width={300}
          height={200}
          className="my-6"
        />
        Error: {error.message}
      </div>
    )
  if (!data) return null

  return <CreatorProfileView creator={data.creator} links={data.links} />
}
