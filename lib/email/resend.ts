import { Resend } from "resend"

import { envConfig } from "@/lib/env"

/** Null when RESEND_API_KEY is not configured — callers degrade gracefully. */
export const resend = envConfig.RESEND_API_KEY
  ? new Resend(envConfig.RESEND_API_KEY)
  : null
