"use client"

import { useEffect, useRef } from "react"

import type { PageAccessResponse, PackAccessResponse } from "./use-unlock-token"

type UnlockMutation = {
  mutateAsync: () => Promise<PageAccessResponse | PackAccessResponse>
}

export function useTokenOnlyAutoUnlock({
  enabled,
  hydrated,
  unlockedContent,
  unlock,
  storeContent,
  setIsAuthorized,
}: {
  enabled: boolean
  hydrated: boolean
  unlockedContent: PageAccessResponse | PackAccessResponse | null
  unlock: UnlockMutation
  storeContent: (content: PageAccessResponse | PackAccessResponse) => void
  setIsAuthorized: (value: boolean) => void
}) {
  const autoUnlockRef = useRef(false)

  useEffect(() => {
    if (!enabled || !hydrated || unlockedContent || autoUnlockRef.current) return

    autoUnlockRef.current = true
    void unlock
      .mutateAsync()
      .then((response) => {
        storeContent(response)
        setIsAuthorized(true)
      })
      .catch(() => {
        autoUnlockRef.current = false
      })
  }, [enabled, hydrated, setIsAuthorized, storeContent, unlock, unlockedContent])
}
