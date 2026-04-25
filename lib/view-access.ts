import crypto from "crypto"

export function getRequestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    ""
  )
}

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex")
}

export function normalizeAddress(address: string | null | undefined) {
  return address?.toLowerCase() ?? ""
}

export function withinGraceWindow(
  lastAccessedAt: string | null,
  graceMs = 5 * 60 * 1000
) {
  if (!lastAccessedAt) return false
  return Date.now() - new Date(lastAccessedAt).getTime() < graceMs
}
