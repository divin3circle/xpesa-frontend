import { NextRequest, NextResponse } from "next/server"

import { requireCreator } from "@/lib/teams/auth"

export type CreatorSearchResult = {
  id: string
  handle: string
  display_name: string
  avatar_url: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, creator } = await requireCreator()
    const q = (new URL(request.url).searchParams.get("q") ?? "").trim()

    if (q.length < 2) {
      return NextResponse.json({ creators: [] })
    }

    // Escape PostgREST `or` filter special chars in the search term.
    const safe = q.replace(/[,%()]/g, " ")
    const { data, error } = await supabase
      .from("creators")
      .select("id, handle, display_name, avatar_url")
      .eq("is_active", true)
      .neq("id", creator.id)
      .or(`handle.ilike.%${safe}%,display_name.ilike.%${safe}%`)
      .limit(8)

    if (error) throw error

    return NextResponse.json({ creators: (data ?? []) as CreatorSearchResult[] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 400 }
    )
  }
}
