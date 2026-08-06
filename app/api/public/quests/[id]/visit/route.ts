import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"

// Public, unauthenticated beacon. Fired twice per visit from the client:
//  1. on page load  -> inserts the visit row (referrer/source/visitor)
//  2. on page hide   -> re-sent with durationMs, which only fills duration_ms
// so the second call never clobbers the referrer/source captured on load.
const visitSchema = z.object({
  sessionId: z.string().trim().min(8).max(80),
  visitorId: z.string().trim().min(8).max(80),
  linkId: z.string().uuid().optional(),
  referrer: z.string().trim().max(400).optional(),
  source: z.string().trim().max(80).optional(),
  durationMs: z.number().int().nonnegative().max(86_400_000).optional(),
})

function normalizeSource(referrer?: string, explicit?: string) {
  if (explicit && explicit.trim()) return explicit.trim().toLowerCase().slice(0, 60)
  if (!referrer || !referrer.trim()) return "direct"
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "")
    if (!host) return "direct"
    if (host.includes("google.")) return "google"
    if (host.includes("t.co") || host.includes("twitter.") || host.includes("x.com"))
      return "twitter"
    if (host.includes("facebook.") || host.includes("fb.")) return "facebook"
    if (host.includes("instagram.")) return "instagram"
    if (host.includes("linkedin.")) return "linkedin"
    if (host.includes("lu.ma") || host.includes("luma")) return "luma"
    return host
  } catch {
    return "direct"
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const input = visitSchema.parse(await request.json())
    const supabase = createAdminClient()

    // Silently ignore beacons for unknown quests so the client never sees an error.
    const { data: quest } = await supabase
      .from("quests")
      .select("id, link_id")
      .eq("id", id)
      .single()

    if (!quest) return NextResponse.json({ ok: true })

    // Duration ping: only update the existing row's duration, keep referrer/source.
    if (typeof input.durationMs === "number") {
      await supabase
        .from("quest_visits")
        .update({ duration_ms: input.durationMs })
        .eq("quest_id", id)
        .eq("session_id", input.sessionId)
      return NextResponse.json({ ok: true })
    }

    await supabase
      .from("quest_visits")
      .upsert(
        {
          quest_id: id,
          link_id: input.linkId ?? quest.link_id ?? null,
          visitor_id: input.visitorId,
          session_id: input.sessionId,
          referrer: input.referrer ?? null,
          source: normalizeSource(input.referrer, input.source),
        },
        { onConflict: "quest_id,session_id", ignoreDuplicates: true }
      )

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record visit" },
      { status: 400 }
    )
  }
}
