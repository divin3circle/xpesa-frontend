import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Wallet center
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage balances, withdrawals, payout methods, and payout settings.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available balance</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            $1,204.75
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estimated KES</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            KES 155,215
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">2</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Primary payout method</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">M-Pesa</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild>
              <Link href="/dashboard/wallet/withdraw">Withdraw funds</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/wallet/history">
                View transaction history
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/wallet/settings">
                Update payout settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Address: <span className="font-mono">0x7A21...Fe89</span>
            </p>
            <p>Network: Base Mainnet</p>
            <p className="text-muted-foreground">
              Payments route directly to this address.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
