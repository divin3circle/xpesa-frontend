"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ModerationCard } from "./moderation-card"
import { ModerationFilters } from "./moderation-filters"
import type { AdminModerationLink } from "./types"
import type { ModerationStatus } from "@/lib/links/types"

export function ModerationAdminView() {
  const [status, setStatus] = useState("pending_review")
  const queryClient = useQueryClient()
  const router = useRouter()

  const query = useQuery({
    queryKey: ["admin-moderation", status],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation?status=${status}`)
      const body = await response.json()
      if (response.status === 403) {
        router.replace("/dashboard")
        throw new Error("Admin access required")
      }
      if (!response.ok) {
        throw new Error(body.error || "Could not load moderation queue")
      }
      return (body.links ?? []) as AdminModerationLink[]
    },
  })

  const actionMutation = useMutation({
    mutationFn: async (input: {
      linkId: string
      status: ModerationStatus | "analyze_ai"
      reason?: string
    }) => {
      const response = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, action: input.status }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || "Moderation action failed")
      return input.status
    },
    onSuccess: (nextStatus) => {
      toast.success(
        nextStatus === "analyze_ai" ? "AI analysis saved" : "Review saved"
      )
      void queryClient.invalidateQueries({ queryKey: ["admin-moderation"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Moderation failed")
    },
  })

  function handleAction(
    linkId: string,
    nextStatus: ModerationStatus | "analyze_ai",
    reason?: string
  ) {
    actionMutation.mutate({ linkId, status: nextStatus, reason })
  }

  const links = query.data ?? []
  const error = query.error instanceof Error ? query.error.message : ""

  return (
    <div className="space-y-6">
      <ModerationFilters value={status} onChange={setStatus} />
      {query.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!query.isLoading && !error && links.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items in this queue.</p>
      ) : null}
      <div className="grid gap-4">
        {links.map((link) => (
          <ModerationCard key={link.id} link={link} onAction={handleAction} />
        ))}
      </div>
    </div>
  )
}
