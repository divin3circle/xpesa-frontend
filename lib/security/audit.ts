type AuditLevel = "info" | "warn" | "error"

const REDACTED_KEY_PATTERN =
  /token|secret|signature|private|password|cookie|signedUrl|r2Key/i

function sanitize(value: unknown): unknown {
  if (!value || typeof value !== "object") return value
  if (Array.isArray(value)) return value.map(sanitize)

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      REDACTED_KEY_PATTERN.test(key) ? "[redacted]" : sanitize(entry),
    ])
  )
}

function sanitizeFields(fields: Record<string, unknown>) {
  return sanitize(fields) as Record<string, unknown>
}

export function auditSecurityEvent(
  level: AuditLevel,
  event: string,
  fields: Record<string, unknown> = {}
) {
  const payload = {
    event,
    ...sanitizeFields(fields),
    at: new Date().toISOString(),
  }

  if (level === "error") {
    console.error(payload)
    return
  }
  if (level === "warn") {
    console.warn(payload)
    return
  }
  console.info(payload)
}
