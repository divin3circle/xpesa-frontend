"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { getUserAvatarURL } from "@/lib/utils"
import { useCreatorSearch, useSendInvite } from "@/hooks/use-teams"

import { cardBase } from "./constants"

export function InviteSection({ teamId }: { teamId: string | null }) {
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
