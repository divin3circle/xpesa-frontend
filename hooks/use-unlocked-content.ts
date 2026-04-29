"use client"

import { useState } from "react"
import type { PageAccessResponse, PackAccessResponse } from "./use-unlock-token"

type UnlockedContent = PageAccessResponse | PackAccessResponse | null

export function useUnlockedContent() {
  const [content, setContent] = useState<UnlockedContent>(null)

  const storeContent = (data: PageAccessResponse | PackAccessResponse) => {
    setContent(data)
  }

  const getPageAccess = (): PageAccessResponse | null => {
    return content && "pageCount" in content ? content : null
  }

  const getPackAccess = (): PackAccessResponse | null => {
    return content && "files" in content ? content : null
  }

  const clear = () => setContent(null)

  return {
    content,
    storeContent,
    getPageAccess,
    getPackAccess,
    clear,
  }
}
