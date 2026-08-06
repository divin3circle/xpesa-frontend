"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const cardBase = "rounded-2xl border border-border/70 bg-transparent shadow-none"

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct / None",
  google: "Google",
  twitter: "X / Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  luma: "Luma",
}

export function QuestSourcesList({
  sources,
}: {
  sources: { source: string; count: number }[]
}) {
  const total = sources.reduce((sum, s) => sum + s.count, 0)

  return (
    <Card className={cardBase}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
        ) : (
          sources.map((item) => {
            const pct = total ? Math.round((item.count / total) * 100) : 0
            return (
              <div
                key={item.source}
                className="relative overflow-hidden rounded-xl border border-border/60"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-primary/10"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between px-3 py-2 text-sm">
                  <span className="truncate pr-3 capitalize">
                    {SOURCE_LABELS[item.source] ?? item.source}
                  </span>
                  <span className="shrink-0 font-medium text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
