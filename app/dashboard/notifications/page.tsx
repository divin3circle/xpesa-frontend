"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Settings2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import {
  useNotifications,
  useMarkNotificationsRead,
} from "@/hooks/use-notifications"
import { useRespondInvite } from "@/hooks/use-teams"

type Filter = "all" | "invite" | "normal"

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "invite", label: "Invites" },
  { key: "normal", label: "Normal" },
]

function statusLabel(value: string) {
  switch (value) {
    case "accept":
    case "accepted":
      return "Accepted"
    case "decline":
    case "declined":
      return "Declined"
    case "revoked":
      return "Invitation revoked"
    case "expired":
      return "Invitation expired"
    default:
      return ""
  }
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all")
  const { data, isLoading } = useNotifications(filter)
  const markRead = useMarkNotificationsRead()
  const respond = useRespondInvite()
  const router = useRouter()
  const [handled, setHandled] = useState<Record<string, string>>({})

  // Mark everything read when the center is opened.
  useEffect(() => {
    markRead.mutate({ all: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onRespond = (
    notificationId: string,
    invitationId: string,
    action: "accept" | "decline"
  ) => {
    respond.mutate(
      { invitationId, action },
      {
        onSuccess: (res) => {
          setHandled((prev) => ({ ...prev, [notificationId]: action }))
          if (action === "accept") {
            toast.success("Joined the team")
            if (res.teamId) router.push(`/dashboard/teams/${res.teamId}`)
          } else {
            toast.success("Invitation declined")
          }
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "Could not respond"),
      }
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Team invites and updates across your workspace.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/settings/notifications">
            <Settings2 className="size-4" /> Settings
          </Link>
        </Button>
      </section>

      <div className="inline-flex gap-1 rounded-full border border-border/70 bg-muted/30 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              filter === f.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid min-h-[160px] place-items-center">
          <LoadingSpinner />
        </div>
      ) : (data?.notifications.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nothing here yet.
        </div>
      ) : (
        <div className="space-y-3">
          {data?.notifications.map((n) => {
            const isInvite = n.category === "invite"
            const invitationId = String(n.data?.invitation_id ?? "")
            const status = String(n.data?.invitation_status ?? "")
            const acted = handled[n.id] ?? (status && status !== "pending" ? status : "")
            const isPending = status === "pending" && !handled[n.id]
            return (
              <div
                key={n.id}
                className={cn(
                  "rounded-2xl border p-4",
                  !n.read_at && "border-primary/40 bg-primary/[0.03]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {isInvite ? (
                        <Badge variant="secondary" className="shrink-0">
                          Invite
                        </Badge>
                      ) : null}
                    </div>
                    {n.body ? (
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    ) : null}
                  </div>
                </div>

                {isInvite && invitationId ? (
                  isPending ? (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        disabled={respond.isPending}
                        onClick={() => onRespond(n.id, invitationId, "accept")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={respond.isPending}
                        onClick={() => onRespond(n.id, invitationId, "decline")}
                      >
                        Decline
                      </Button>
                    </div>
                  ) : acted ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {statusLabel(acted)}
                    </p>
                  ) : null
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
