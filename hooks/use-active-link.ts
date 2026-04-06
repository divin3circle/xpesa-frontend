"use client"

import { usePathname } from "next/navigation"

export function useActiveLink(href: string): boolean {
  const pathname = usePathname()
  const normalizedHref = href.endsWith("/") ? href.slice(0, -1) : href
  const normalizedPathname = pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname

  // Exact match or starts with for nested routes
  return (
    normalizedPathname === normalizedHref ||
    normalizedPathname.startsWith(normalizedHref + "/")
  )
}
