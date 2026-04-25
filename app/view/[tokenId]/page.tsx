"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { UnifiedFileExplorer } from "@/components/viewer/unified-file-explorer"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function ViewTokenPage() {
  const params = useParams<{ tokenId: string }>()
  const tokenId = params?.tokenId
  
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenId) return

    async function fetchData() {
      try {
        const response = await fetch(`/api/tokens/${tokenId}`)
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || "Failed to fetch asset details")
        }
        const json = await response.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tokenId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-10 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-3xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500">{error || "This link has expired or is invalid."}</p>
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
