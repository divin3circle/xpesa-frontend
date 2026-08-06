// Shared helpers for quest analytics endpoints.

export const ANALYTICS_PERIODS = ["7d", "30d", "3m", "6m", "12m", "all"] as const
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number]

const PERIOD_DAYS: Record<Exclude<AnalyticsPeriod, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "3m": 90,
  "6m": 180,
  "12m": 365,
}

export function parsePeriod(raw: string | null | undefined): AnalyticsPeriod {
  return (ANALYTICS_PERIODS as readonly string[]).includes(raw ?? "")
    ? (raw as AnalyticsPeriod)
    : "all"
}

/** ISO cutoff for the period, or null for "all time". */
export function periodSince(period: AnalyticsPeriod): string | null {
  if (period === "all") return null
  const d = new Date()
  d.setDate(d.getDate() - PERIOD_DAYS[period])
  return d.toISOString()
}

export function afterSince(iso: string | null | undefined, since: string | null) {
  if (!iso) return false
  if (!since) return true
  return iso >= since
}

/** Bucket a set of ISO timestamps into { date: "YYYY-MM-DD", count } sorted ascending. */
export function groupByDay(timestamps: Array<string | null | undefined>) {
  const counts = new Map<string, number>()
  for (const ts of timestamps) {
    if (!ts) continue
    const day = ts.slice(0, 10)
    counts.set(day, (counts.get(day) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function averageMs(values: Array<number | null | undefined>) {
  const nums = values.filter((v): v is number => typeof v === "number" && v >= 0)
  if (!nums.length) return 0
  return Math.round(nums.reduce((s, v) => s + v, 0) / nums.length)
}
