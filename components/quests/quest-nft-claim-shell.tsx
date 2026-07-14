import type { ReactNode } from "react"
import { Gift } from "lucide-react"

export function QuestNftClaimShell({
  title,
  copy,
  children,
}: {
  title: string
  copy: string
  children?: ReactNode
}) {
  return (
    <div className="mb-5 rounded-2xl border bg-foreground/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-background">
            <Gift className="size-5" />
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
