import { NextRequest, NextResponse } from "next/server"

import { envConfig } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"
import { reconcileFiatOnramp } from "@/lib/payments/settlement"
import { auditSecurityEvent } from "@/lib/security/audit"

/**
 * Internal finalizer for a fiat onramp intent (called by a cron/manual job, not
 * the fan's browser). Requires the shared RECONCILE_SECRET. Reconciles against
 * the provider's authoritative status before settling — an unauthenticated or
 * premature call can never move money.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const secret = envConfig.RECONCILE_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "Reconcile endpoint is not configured" },
      { status: 503 }
    )
  }

  const provided =
    request.headers.get("x-reconcile-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    ""
  if (provided !== secret) {
    auditSecurityEvent("warn", "reconcile_unauthorized", { intentId: id })
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    const result = await reconcileFiatOnramp({
      supabase,
      paymentIntentId: id,
      requestHeaders: request.headers,
    })
    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to reconcile intent",
      },
      { status: 500 }
    )
  }
}
