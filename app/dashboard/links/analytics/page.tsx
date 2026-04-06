import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const analytics = [
  { label: "Total views", value: "3,247" },
  { label: "Payments", value: "427" },
  { label: "Conversion", value: "13.1%" },
  { label: "Revenue", value: "$6,842" },
]

export default function LinksAnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Badge variant="outline">Analytics</Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Links performance
        </h1>
        <p className="text-sm text-muted-foreground">
          Track view-to-payment conversion and identify top earning links.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top links this month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-md border p-3">
              React Native Crash Course - $396
            </div>
            <div className="rounded-md border p-3">
              Design teardown notes - $76
            </div>
            <div className="rounded-md border p-3">Buy me chai - $48</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-md border p-3">Views: 3,247</div>
            <div className="rounded-md border p-3">Wallet connects: 812</div>
            <div className="rounded-md border p-3">
              Successful payments: 427
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
