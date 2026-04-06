import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const withdrawals = [
  { date: "2026-04-05", usdc: "$420", kes: "KES 54,010", status: "Processing" },
  { date: "2026-04-03", usdc: "$280", kes: "KES 36,128", status: "Completed" },
]

export default function WithdrawFundsPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Withdraw to M-Pesa
        </h1>
        <p className="text-sm text-muted-foreground">
          Convert USDC earnings to KES and send directly to your M-Pesa number.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Withdrawal request</CardTitle>
            <CardDescription>
              Available balance: $1,204.75 (~KES 155,215)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount (USDC)</Label>
              <Input id="withdraw-amount" placeholder="100.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdraw-phone">M-Pesa number</Label>
              <Input id="withdraw-phone" placeholder="07XXXXXXXX" />
            </div>
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p>You receive approximately: KES 12,884</p>
              <p className="text-muted-foreground">
                Includes estimated conversion + processing fee.
              </p>
            </div>
            <div className="flex gap-2">
              <Button>Withdraw to M-Pesa</Button>
              <Button variant="secondary">Withdraw all</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Confirmation preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>USDC amount: $100.00</p>
            <p>Estimated KES: KES 12,884</p>
            <p>M-Pesa: 07XXXXXXXX</p>
            <p className="text-muted-foreground">
              Processing window: 1-5 minutes
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {withdrawals.map((item) => (
              <div
                key={`${item.date}-${item.usdc}`}
                className="grid grid-cols-2 gap-2 rounded-md border p-3 md:grid-cols-4"
              >
                <p>{item.date}</p>
                <p>{item.usdc}</p>
                <p>{item.kes}</p>
                <p className="text-muted-foreground">{item.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
