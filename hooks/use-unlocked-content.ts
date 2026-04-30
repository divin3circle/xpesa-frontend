"use client"

import { useEffect, useMemo, useState } from "react"
import type { PageAccessResponse, PackAccessResponse } from "./use-unlock-token"

type UnlockedContent = PageAccessResponse | PackAccessResponse | null

type PersistedUnlockedContent = {
  content: PageAccessResponse | PackAccessResponse
}

const STORAGE_PREFIX = "xpesa:unlocked-content:"

function isExpired(expiresAt: string | null | undefined) {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() <= Date.now()
}

function getStorageKey(tokenId?: string) {
  return tokenId ? `${STORAGE_PREFIX}${tokenId}` : null
}

export function useUnlockedContent(tokenId?: string) {
  const storageKey = useMemo(() => getStorageKey(tokenId), [tokenId])
  const [content, setContent] = useState<UnlockedContent>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setContent(null)

    if (!storageKey || typeof window === "undefined") {
      setHydrated(true)
      return
    }

    try {
      const raw = window.sessionStorage.getItem(storageKey)
      if (!raw) {
        setHydrated(true)
        return
      }

      const parsed = JSON.parse(raw) as PersistedUnlockedContent
      if (
        !parsed?.content ||
        isExpired(parsed.content.previewSessionExpiresAt)
      ) {
        window.sessionStorage.removeItem(storageKey)
        setHydrated(true)
        return
      }

      setContent(parsed.content)
    } catch {
      window.sessionStorage.removeItem(storageKey)
    } finally {
      setHydrated(true)
    }
  }, [storageKey])

  const storeContent = (data: PageAccessResponse | PackAccessResponse) => {
    setContent(data)

    if (storageKey && typeof window !== "undefined") {
      const persisted: PersistedUnlockedContent = { content: data }
      window.sessionStorage.setItem(storageKey, JSON.stringify(persisted))
    }
  }

  const getPageAccess = (): PageAccessResponse | null => {
    return content && "pageCount" in content ? content : null
  }

  const getPackAccess = (): PackAccessResponse | null => {
    return content && "files" in content ? content : null
  }

  const clear = () => {
    setContent(null)

    if (storageKey && typeof window !== "undefined") {
      window.sessionStorage.removeItem(storageKey)
    }
  }

  return {
    content,
    hydrated,
    storeContent,
    getPageAccess,
    getPackAccess,
    clear,
  }
}
