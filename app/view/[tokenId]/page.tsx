"use client"

import React, { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { UnifiedFileExplorer } from "@/components/viewer/unified-file-explorer"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { useTokenDetails } from "@/hooks/use-token-details"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons"
import { ReceiptMintPanel } from "@/components/receipts/receipt-mint-panel"

export default function ViewTokenPage() {
  const params = useParams<{ tokenId: string }>()
  const tokenId = params?.tokenId
  const router = useRouter()

  const { data, isLoading, error } = useTokenDetails(tokenId)

  useEffect(() => {
    if (!error) return
    toast.error(getErrorMessage(error))
  }, [error])

  if (isLoading) {
    return (
      <div className="min-h-screen space-y-8 p-10">
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-3 w-48" />
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
          <Button
            variant="outline"
            className="mt-4 flex items-center gap-1"
            onClick={() => router.back()}
          >
            <HugeiconsIcon icon={ArrowLeft01FreeIcons} />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-6 pt-6 lg:px-10">
        <ReceiptMintPanel
          accessToken={tokenId}
          requiredWalletAddress={data.token.fanWalletAddress}
        />
      </div>
      <UnifiedFileExplorer
        tokenId={tokenId!}
        linkId={data.link.id}
        title={data.link.title}
        files={data.files}
        linkType={data.link.type}
        fanWalletAddress={data.token.fanWalletAddress}
      />
    </>
  )
}
