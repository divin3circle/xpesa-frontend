import { NextResponse } from "next/server"
import { envConfig } from "@/lib/env"

export async function GET(request: Request) {
  try {
    const { search } = new URL(request.url)
    const base = envConfig.KOTANI_BASE_URL

    if (!base) {
      return NextResponse.json(
        { error: "Kotani base URL not configured" },
        { status: 500 }
      )
    }

    const target = `${base.replace(/\/$/, "")}/rates${search}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (envConfig.KOTANI_KEY) headers["x-kotani-key"] = envConfig.KOTANI_KEY
    if (envConfig.KOTANI_SECRET)
      headers["x-kotani-secret"] = envConfig.KOTANI_SECRET

    const resp = await fetch(target, { method: "GET", headers })

    const body = await resp
      .json()
      .catch(() => ({ message: "invalid json from kotani" }))

    return NextResponse.json(body, { status: resp.status })
  } catch (err) {
    return NextResponse.json({ error: "Kotani proxy failed" }, { status: 502 })
  }
}
