export function WithdrawHistorySkeleton() {
  return (
    <div className="mt-8 space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-24 animate-pulse rounded-xl border border-border/40 bg-muted/30"
        />
      ))}
    </div>
  )
}
