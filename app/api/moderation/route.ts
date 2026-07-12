import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "AI moderation is admin-triggered only" },
    { status: 403 }
  )
}
