"use client"

import { useEffect } from "react"

const VISITOR_KEY = "xpesa:visitor-id"

function readVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

/**
 * Records an anonymous visit to a public quest surface (Tally-style "form visitor").
 * Fires an insert beacon on mount and a duration beacon on page-hide, keyed by a
 * per-mount session id so each visit is counted once and its dwell time captured.
 */
export function useQuestVisit(questId?: string | null, linkId?: string | null) {
  useEffect(() => {
    if (!questId || typeof window === "undefined") return

    const visitorId = readVisitorId()
    const sessionId = crypto.randomUUID()
    const startedAt = Date.now()
    const url = `/api/public/quests/${questId}/visit`

    let source: string | undefined
    try {
      source = new URLSearchParams(window.location.search).get("utm_source") ?? undefined
    } catch {
      source = undefined
    }

    // Insert beacon (page load).
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sessionId,
        visitorId,
        linkId: linkId ?? undefined,
        referrer: document.referrer || undefined,
        source,
      }),
    }).catch(() => {})

    let sent = false
    const sendDuration = () => {
      if (sent) return
      sent = true
      const payload = JSON.stringify({
        sessionId,
        visitorId,
        durationMs: Date.now() - startedAt,
      })
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }))
          return
        }
      } catch {
        // fall through to fetch
      }
      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: payload,
      }).catch(() => {})
    }

    const onHide = () => {
      if (document.visibilityState === "hidden") sendDuration()
    }
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("pagehide", sendDuration)

    return () => {
      document.removeEventListener("visibilitychange", onHide)
      window.removeEventListener("pagehide", sendDuration)
      sendDuration()
    }
  }, [questId, linkId])
}
