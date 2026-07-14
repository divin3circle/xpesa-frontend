"use client"

export function QuestProgressHeader({
  title,
  completed,
  total,
}: {
  title: string
  completed: number
  total: number
}) {
  const percent = Math.round((completed / total) * 100)

  return (
    <div className="border-b bg-foreground p-6 text-background">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-background/70">Live quest</p>
        <span className="rounded-full bg-background/10 px-3 py-1 text-xs font-medium">
          {percent}% complete
        </span>
      </div>
      <h1 className="mt-2 font-heading text-3xl font-semibold">{title}</h1>
      <div className="mt-5 h-3 rounded-full bg-background/15">
        <div
          className="h-full rounded-full bg-background transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
