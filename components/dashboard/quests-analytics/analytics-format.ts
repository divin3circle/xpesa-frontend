export function formatDuration(ms: number) {
  if (!ms || ms < 0) return "0s"
  const totalSeconds = Math.round(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function formatPercent(ratio: number) {
  return `${Math.round((ratio || 0) * 100)}%`
}

export function formatDay(date: string) {
  // date is "YYYY-MM-DD"
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
