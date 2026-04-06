import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const stats = [
  { label: "Total earned", value: "$6,842.11", hint: "All time" },
  { label: "This month", value: "$1,204.75", hint: "+14.3% vs last month" },
  { label: "Transactions", value: "427", hint: "Confirmed payments" },
  { label: "Active links", value: "18", hint: "4 tip links, 14 gate links" },
]

const recentTransactions = [
  {
    link: "React Native Crash Course",
    wallet: "0x4D2B...A91e",
    amount: "$12.00",
    date: "Today, 11:42",
    hash: "0x9f...e2b",
  },
  {
    link: "Product Design Teardown",
    wallet: "0x91Aa...f2B0",
    amount: "$5.00",
    date: "Today, 09:18",
    hash: "0x7a...119",
  },
  {
    link: "Buy me chai",
    wallet: "0x8Fe1...c44b",
    amount: "$3.50",
    date: "Yesterday",
    hash: "0x8d...413",
  },
]

export default function Page() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Badge variant="outline">Dashboard</Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Good afternoon, Wanjiru
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is a live snapshot of your earnings, links, and payout readiness.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              {stat.hint}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
              Last 10 confirmed payments from your audience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.hash}
                className="grid grid-cols-2 gap-3 rounded-md border p-3 text-sm md:grid-cols-5"
              >
                <div className="col-span-2">
                  <p className="font-medium">{tx.link}</p>
                  <p className="text-xs text-muted-foreground">{tx.wallet}</p>
                </div>
                <p className="font-medium">{tx.amount}</p>
                <p className="text-muted-foreground">{tx.date}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {tx.hash}
                </p>
              </div>
            ))}
            <Button variant="outline" asChild>
              <Link href="/dashboard/wallet/history">
                View all transactions
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              High-frequency workflows for creators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/links/create">Create new link</Link>
            </Button>
            <Button
              variant="secondary"
              asChild
              className="w-full justify-start"
            >
              <Link href="/dashboard/wallet/withdraw">Withdraw to M-Pesa</Link>
            </Button>
            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              Wallet: <span className="font-mono">0x7A21...Fe89</span>
              <br />
              Network: Base Mainnet
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
