"use client"

import React, { useEffect } from "react"
import { useParams } from "next/navigation"
import { UnifiedFileExplorer } from "@/components/viewer/unified-file-explorer"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { useTokenDetails } from "@/hooks/use-token-details"

export default function ViewTokenPage() {
  const params = useParams<{ tokenId: string }>()
  const tokenId = params?.tokenId

  const { data, isLoading, error } = useTokenDetails(tokenId)

  useEffect(() => {
    if (!error) return
    toast.error(getErrorMessage(error))
  }, [error])

  if (isLoading) {
    return (
      <div className="min-h-screen space-y-8 p-10">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !data) {
    const errorMessage = error
      ? getErrorMessage(error)
      : "This link has expired or is invalid."

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-red-500">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <UnifiedFileExplorer
      tokenId={tokenId!}
      title={data.link.title}
      files={data.files}
      linkType={data.link.type}
      fanWalletAddress={data.token.fanWalletAddress}
    />
  )
}
