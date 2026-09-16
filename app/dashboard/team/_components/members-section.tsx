"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  useRemoveMember,
  useRevokeInvite,
  useTeamMembers,
  useUpdateMember,
} from "@/hooks/use-teams"

import { ActivitySection } from "./activity-section"
import { cardBase } from "./constants"

export function MembersSection({ teamId }: { teamId: string }) {
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
