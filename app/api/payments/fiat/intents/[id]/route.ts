import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: intent, error } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !intent) {
    return NextResponse.json({ error: "Payment intent not found" }, { status: 404 })
  }

  return NextResponse.json({ intent })
}
