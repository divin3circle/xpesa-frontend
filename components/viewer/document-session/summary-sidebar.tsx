import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DocumentSummarySidebar({
  tokenId,
  expiresIn,
  viewsRemaining,
}: {
  tokenId?: string
  expiresIn: string
  viewsRemaining?: number
}) {
  return (
    <aside className="space-y-6">
      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Access summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
            <span className="text-muted-foreground">Token</span>
            <span className="font-medium">{tokenId}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
            <span className="text-muted-foreground">Expires</span>
            <span className="font-medium">{expiresIn}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
            <span className="text-muted-foreground">Opens left</span>
            <span className="font-medium">
              {typeof viewsRemaining === "number"
                ? viewsRemaining
                : "Unlimited"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>About this session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Your wallet signature proves you have the right to access this
            protected content without storing sensitive keys.
          </p>
          <p>
            View limits, IP binding, and expiry are all enforced server-side for
            security.
          </p>
        </CardContent>
      </Card>
    </aside>
  )
}
