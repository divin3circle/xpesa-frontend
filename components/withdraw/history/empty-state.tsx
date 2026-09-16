export function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center">
      <p className="font-medium">No withdrawals yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Your recent withdrawal requests will appear here.
      </p>
    </div>
  )
}
