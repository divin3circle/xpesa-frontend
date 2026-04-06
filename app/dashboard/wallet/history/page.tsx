import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const history = [
  {
    date: "2026-04-05 11:42",
    link: "React Native Crash Course",
    wallet: "0x4D2B...A91e",
    amount: "$12.00",
    fee: "$0.60",
    net: "$11.40",
    hash: "0x9f...e2b",
  },
  {
    date: "2026-04-05 09:18",
    link: "Design teardown notes",
    wallet: "0x91Aa...f2B0",
    amount: "$5.00",
    fee: "$0.25",
    net: "$4.75",
    hash: "0x7a...119",
  },
]

export default function TransactionHistoryPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Transaction history
        </h1>
        <p className="text-sm text-muted-foreground">
          Full record of all creator earnings with fees and net amount.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Start date" />
          <Input placeholder="End date" />
          <Input placeholder="Link title" />
          <Button>Apply filters</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.map((item) => (
            <div key={item.hash} className="rounded-md border p-3 text-sm">
              <div className="grid gap-2 md:grid-cols-7">
                <p>{item.date}</p>
                <p>{item.link}</p>
                <p className="font-mono text-xs">{item.wallet}</p>
                <p>{item.amount}</p>
                <p>{item.fee}</p>
                <p>{item.net}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {item.hash}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
