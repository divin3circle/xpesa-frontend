import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExpiryOverlay({ linkId }: { linkId?: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your access has expired</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            This token is no longer valid. You can pay again to unlock access.
          </p>
          <Button asChild>
            <Link href={`/pay/${linkId ?? "demo-link"}`}>Pay again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
