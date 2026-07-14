"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import type { Link as LinkRecord } from "@/lib/links/types"

export function LinkDashboardHeader({ link }: { link: LinkRecord }) {
  const router = useRouter()

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Content dashboard</p>
        <h1 className="font-heading text-3xl font-semibold">{link.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{link.description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
        <Button asChild><Link href={`/pay/${link.id}`}>Open public page</Link></Button>
      </div>
    </section>
  )
}
