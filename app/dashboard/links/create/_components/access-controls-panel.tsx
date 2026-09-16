import { Input } from "@/components/ui/input"

export function AccessControlsPanel({
  showBlockDownload = false,
}: {
  showBlockDownload?: boolean
}) {
  return (
    <details className="rounded-xl border p-4">
      <summary className="cursor-pointer text-sm font-medium">
        Access Controls
      </summary>
      <div className="mt-4 grid gap-3">
        <label className="flex items-center justify-between text-sm">
          Expiry
          <select className="h-9 rounded-md border bg-background px-3 text-xs">
            <option>Forever</option>
            <option>One-time only</option>
            <option>5 minutes</option>
            <option>1 hour</option>
            <option>24 hours</option>
            <option>7 days</option>
            <option>30 days</option>
          </select>
        </label>
        <label className="flex items-center justify-between text-sm">
          Max opens
          <Input
            className="h-9 max-w-28"
            placeholder="Unlimited"
            type="number"
            min={1}
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          IP binding
          <input type="checkbox" className="size-4" />
        </label>
        <label className="flex items-center justify-between text-sm text-muted-foreground">
          Wallet binding (always on)
          <input
            type="checkbox"
            checked
            readOnly
            disabled
            className="size-4"
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          Wallet watermark
          <input type="checkbox" defaultChecked className="size-4" />
        </label>
        {showBlockDownload ? (
          <label className="flex items-center justify-between text-sm">
            Block download & print
            <input type="checkbox" defaultChecked className="size-4" />
          </label>
        ) : null}
      </div>
    </details>
  )
}
