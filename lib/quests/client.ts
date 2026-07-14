"use client"

export async function questJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || "Quest request failed")
  return body as T
}

export function postQuestJson<T>(
  url: string,
  body: Record<string, unknown>
): Promise<T> {
  return questJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
