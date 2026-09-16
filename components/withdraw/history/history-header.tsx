export function HistoryHeader({
  title,
  description,
  summary,
}: {
  title: string
  description: string
  summary: { completed: number; pending: number }
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-heading text-2xl font-semibold">{title}</h1>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{summary.completed} completed</span>
        <span className="size-1 rounded-full bg-muted-foreground/50" />
        <span>{summary.pending} pending</span>
      </div>
    </div>
  )
}
