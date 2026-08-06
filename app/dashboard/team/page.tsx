"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Trash2, UserPlus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { getUserAvatarURL } from "@/lib/utils"
import {
  useCreatorSearch,
  useMyTeams,
  useRemoveMember,
  useRevokeInvite,
  useSendInvite,
  useTeamActivity,
  useTeamMembers,
  useUpdateMember,
} from "@/hooks/use-teams"

const ACTIVITY_LABEL: Record<string, string> = {
  invite_sent: "sent an invite",
  invite_revoked: "revoked an invite",
  invite_declined: "declined an invite",
  member_joined: "joined the team",
  member_left: "left the team",
  member_removed: "removed a member",
  member_updated: "updated a member",
  viewed_analytics: "viewed analytics",
  exported_csv: "exported data",
}

const cardBase = "rounded-2xl border border-border/70 bg-transparent shadow-none"

export default function TeamPage() {
  const { data: teams, isLoading } = useMyTeams()
  const teamId = teams?.owned?.id ?? null

  if (isLoading) {
    return (
      <div className="grid min-h-[300px] place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          Invite other creators to view your analytics, and manage what they can do.
        </p>
      </section>

      <InviteSection teamId={teamId} />
      {teamId ? (
        <MembersSection teamId={teamId} />
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Your team is created the moment you send your first invite.
        </div>
      )}
    </div>
  )
}

function InviteSection({ teamId }: { teamId: string | null }) {
  const [q, setQ] = useState("")
  const [debounced, setDebounced] = useState("")
  const [role, setRole] = useState<"member" | "admin">("member")
  const { data: search, isFetching } = useCreatorSearch(debounced)
  const sendInvite = useSendInvite()

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250)
    return () => clearTimeout(t)
  }, [q])

  const invite = (handle: string) => {
    sendInvite.mutate(
      { handle, role, teamId: teamId ?? undefined },
      {
        onSuccess: () => {
          toast.success(`Invite sent to @${handle}`)
          setQ("")
          setDebounced("")
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "Could not send invite"),
      }
    )
  }

  return (
    <Card className={cardBase}>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Invite a creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by handle or name…"
            className="flex-1"
          />
          <Select value={role} onValueChange={(v) => setRole(v as "member" | "admin")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {debounced.length >= 2 ? (
          <div className="divide-y rounded-2xl border">
            {isFetching ? (
              <p className="p-3 text-sm text-muted-foreground">Searching…</p>
            ) : (search?.creators.length ?? 0) === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">No creators found.</p>
            ) : (
              search?.creators.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={getUserAvatarURL(c.avatar_url)} alt={c.display_name} />
                      <AvatarFallback>
                        {c.display_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{c.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{c.handle}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={sendInvite.isPending}
                    onClick={() => invite(c.handle)}
                  >
                    <UserPlus className="size-4" /> Invite
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function MembersSection({ teamId }: { teamId: string }) {
  const { data, isLoading } = useTeamMembers(teamId)
  const updateMember = useUpdateMember(teamId)
  const removeMember = useRemoveMember(teamId)
  const revokeInvite = useRevokeInvite(teamId)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const canManage = useMemo(
    () => data?.myRole === "owner" || data?.myRole === "admin",
    [data?.myRole]
  )

  if (isLoading) {
    return (
      <div className="grid min-h-[160px] place-items-center">
        <LoadingSpinner />
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="space-y-6">
      <Card className={cardBase}>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">
            Members ({data.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {data.members.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={getUserAvatarURL(m.avatar_url)} alt={m.display_name} />
                  <AvatarFallback>
                    {m.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{m.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{m.handle}</p>
                </div>
                <Badge variant={m.role === "owner" ? "default" : "outline"} className="ml-1 capitalize">
                  {m.role}
                </Badge>
              </div>

              {canManage && m.role !== "owner" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={m.can_export ? "default" : "outline"}
                    disabled={pendingId === m.id}
                    onClick={() => {
                      setPendingId(m.id)
                      updateMember.mutate(
                        { memberId: m.id, canExport: !m.can_export },
                        {
                          onSuccess: () =>
                            toast.success(
                              `Export ${!m.can_export ? "enabled" : "disabled"} for ${m.display_name}`
                            ),
                          onError: (e) =>
                            toast.error(e instanceof Error ? e.message : "Could not update"),
                          onSettled: () => setPendingId(null),
                        }
                      )
                    }}
                  >
                    {pendingId === m.id ? <LoadingSpinner size={4} /> : null}
                    Export {m.can_export ? "on" : "off"}
                  </Button>
                  <Select
                    value={m.role}
                    onValueChange={(v) => {
                      setPendingId(m.id)
                      updateMember.mutate(
                        { memberId: m.id, role: v as "admin" | "member" },
                        {
                          onSuccess: () => toast.success("Role updated"),
                          onError: (e) =>
                            toast.error(e instanceof Error ? e.message : "Could not update"),
                          onSettled: () => setPendingId(null),
                        }
                      )
                    }}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Remove ${m.display_name} from the team?`)) {
                        removeMember.mutate(m.id, {
                          onSuccess: () => toast.success("Member removed"),
                        })
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {canManage && data.invitations.length > 0 ? (
        <Card className={cardBase}>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">
              Pending invites ({data.invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {data.invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{inv.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{inv.handle} · {inv.role}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    revokeInvite.mutate(inv.id, {
                      onSuccess: () => toast.success("Invite revoked"),
                    })
                  }
                >
                  Revoke
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {canManage ? <ActivitySection teamId={teamId} /> : null}
    </div>
  )
}

const ACTIVITY_PAGE_SIZE = 5

function ActivitySection({ teamId }: { teamId: string }) {
  const { data } = useTeamActivity(teamId)
  const activity = data?.activity ?? []
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(activity.length / ACTIVITY_PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const start = current * ACTIVITY_PAGE_SIZE
  const visible = activity.slice(start, start + ACTIVITY_PAGE_SIZE)

  return (
    <Card className={cardBase}>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <>
            <div className="divide-y">
              {visible.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">
                      {a.actor?.display_name ?? "Someone"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {ACTIVITY_LABEL[a.action] ?? a.action.replace(/_/g, " ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            {pageCount > 1 ? (
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                <span className="text-xs text-muted-foreground">
                  Page {current + 1} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current === 0}
                    onClick={() => setPage(current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current >= pageCount - 1}
                    onClick={() => setPage(current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
