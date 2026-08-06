import { NextRequest, NextResponse } from "next/server"

import { requireCreator } from "@/lib/teams/auth"

export type NotificationRow = {
  id: string
  type: string
  category: "invite" | "normal"
  title: string
  body: string | null
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export type NotificationsResponse = {
  notifications: NotificationRow[]
  unread: number
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, creator } = await requireCreator()
    const filter = new URL(request.url).searchParams.get("filter") ?? "all"

    let query = supabase
      .from("notifications")
      .select("id, type, category, title, body, data, read_at, created_at")
      .eq("recipient_creator_id", creator.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (filter === "invite") query = query.eq("category", "invite")
    else if (filter === "normal") query = query.eq("category", "normal")

    const { data } = await query
    const notifications = (data ?? []) as NotificationRow[]

    // Enrich invite notifications with their invitation's current status so the
    // UI can hide Accept/Decline once an invite is no longer pending.
    const inviteIds = notifications
      .filter((n) => n.category === "invite")
      .map((n) => String(n.data?.invitation_id ?? ""))
      .filter(Boolean)
    if (inviteIds.length > 0) {
      const { data: invs } = await supabase
        .from("team_invitations")
        .select("id, status")
        .in("id", inviteIds)
      const statusById = new Map(
        (invs ?? []).map((i) => [String(i.id), String(i.status)])
      )
      for (const n of notifications) {
        if (n.category === "invite") {
          const invId = String(n.data?.invitation_id ?? "")
          n.data = {
            ...n.data,
            invitation_status: invId ? statusById.get(invId) ?? "unknown" : "unknown",
          }
        }
      }
    }

    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_creator_id", creator.id)
      .is("read_at", null)

    return NextResponse.json<NotificationsResponse>({
      notifications,
      unread: count ?? 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load notifications" },
      { status: 400 }
    )
  }
}
