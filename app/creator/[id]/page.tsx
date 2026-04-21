"use client"

import LoadingSpinner from "@/components/ui/loading-spinner"
import { usePublicCreator } from "@/hooks/use-public"
import { use } from "react"

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
      <div className="h-screen w-screen text-red-500">
        Error: {error.message}
      </div>
    )
  if (!data) return null

  return (
    <div className="mt-2 max-w-7xl px-2">
      <h1>{data.creator.display_name}</h1>
      <p>{data.creator.bio}</p>
      <div>
        {data.links.map((link) => (
          <div key={link.id}>{link.title}</div>
        ))}
      </div>
    </div>
  )
}
