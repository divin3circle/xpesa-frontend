import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

const sections = [
  {
    title: "For Creators",
    body: "Creator onboarding, public pages, gate + tip links, x402 payments, and M-Pesa withdrawals.",
  },
  {
    title: "For Fans",
    body: "Understanding the fan payment flow, no-account payments, smart accounts, and instant access to creator content.",
  },
  {
    title: "Data and Security",
    body: "How we secure creator links and fan payments, our data model, and how we handle personally identifiable information.",
  },
  {
    title: "Terms & Policies",
    body: "Our terms of service, privacy policy, and acceptable use policy for creators and fans using xpesa.",
  },
]

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <section className="space-y-2">
        <Badge variant="outline">xpesa docs</Badge>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Read the docs
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          The docs cover how creators can set up paid links, share them with
          their audience, and withdraw earnings to local mobile money accounts.
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
      <Link
        href="https://xpesa.mintlify.app/"
        rel="noopener noreferrer"
        target="_blank"
        className="text-sm text-muted-foreground hover:underline"
      >
        Explore the full documentation
      </Link>
    </div>
  )
}
