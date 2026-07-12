import { NextRequest, NextResponse } from "next/server"

import { requireModerationAdmin } from "@/lib/moderation/admin"
import { runLinkModeration } from "@/lib/moderation/run"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const admin = await requireModerationAdmin()
  if (admin.error) return NextResponse.json({ error: admin.error }, { status: 403 })

  const status = new URL(request.url).searchParams.get("status")
  const supabase = createAdminClient()
  let query = supabase
    .from("links")
    .select("*, creator:creators(display_name, handle)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (status && status !== "all") query = query.eq("moderation_status", status)
  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ links: data ?? [] })
}

export async function POST(request: NextRequest) {
  const admin = await requireModerationAdmin()
  if (admin.error || !admin.user) {
    return NextResponse.json({ error: admin.error }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  if (body.action === "analyze_ai" && typeof body.linkId === "string") {
    const analysis = await runLinkModeration(body.linkId, admin.user)
    return NextResponse.json({ analysis })
  }

  if (!["approved", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid moderation action" }, { status: 400 })
  }

  const reason = String(body.reason || "Manual moderation update")
  const supabase = createAdminClient()
  const { data: link, error } = await supabase
    .from("links")
    .select("id, moderation_status")
    .eq("id", body.linkId)
    .single()

  if (error || !link) {
    return NextResponse.json({ error: error?.message || "Link not found" }, { status: 404 })
  }

  await supabase.from("links").update({
    moderation_status: body.status,
    moderation_reason: reason,
    moderation_reviewed_at: new Date().toISOString(),
    moderation_reviewed_by: admin.user.id,
  }).eq("id", link.id)

  await supabase.from("content_moderation_events").insert({
    link_id: link.id,
    actor_type: "admin",
    actor_id: admin.user.id,
    action: "manual_review",
    status_from: link.moderation_status,
    status_to: body.status,
    reason,
  })

  return NextResponse.json({ ok: true })
}
