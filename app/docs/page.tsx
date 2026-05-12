import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const sections = [
  {
    title: "V1 Scope",
    body: "Creator onboarding, public pages, gate + tip links, x402 payments, and M-Pesa withdrawals.",
  },
  {
    title: "UI Pages",
    body: "13 core pages across auth, onboarding, dashboard, public creator pages, and fan payment flow.",
  },
  {
    title: "Database",
    body: "Postgres + Drizzle with core tables: creators, links, transactions, access_tokens, withdrawals.",
  },
  {
    title: "API Routes",
    body: "Next.js route handlers for auth, onboarding, links CRUD, payments, dashboard stats, and payouts.",
  },
]

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <section className="space-y-2">
        <Badge variant="outline">Xydra reference</Badge>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Product documentation
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          V1 implementation reference for pages, schema, API surface, and payout
          architecture.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>V1 technology stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Frontend: Next.js App Router, TypeScript, Tailwind, shadcn/ui</p>
            <p>
              Wallet + chain: ThirdWeb, Hedera (env-driven), USDC, x402 flow
            </p>
            <p>Data: Neon Postgres + Drizzle, Upstash Redis, Cloudflare R2</p>
            <p>Payouts: Kotani Pay M-Pesa offramp pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>V1 shipping priorities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Frictionless creator onboarding in under 3 minutes.</p>
            <p>2. Clean fan payment flow with no fan account required.</p>
            <p>3. Reliable payment confirmation + secure URL reveal.</p>
            <p>4. Fast creator withdrawal flow to M-Pesa.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
