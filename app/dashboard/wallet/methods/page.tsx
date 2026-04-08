import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SupportedMethodsPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Supported payout methods
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose where your creator earnings settle after conversion.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-2 border-chart-1/60 bg-transparent shadow-chart-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>M-Pesa</CardTitle>
              <Badge>Selected</Badge>
            </div>
            <CardDescription>
              Fast settlement to Kenyan phone numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Processing: 1-5 minutes</p>
            <p>Region: Kenya</p>
            <Button className="w-full">Use method</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Bank transfer</CardTitle>
            <CardDescription>Planned for Phase 2</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Processing: Same-day</p>
            <p>Region: Kenya + East Africa</p>
            <Button className="w-full" variant="secondary" disabled>
              Coming soon
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Stablecoin hold</CardTitle>
            <CardDescription>Keep earnings in USDC</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Processing: Instant</p>
            <p>Network: Multiple</p>
            <Button className="w-full" variant="outline">
              Manage wallet
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
