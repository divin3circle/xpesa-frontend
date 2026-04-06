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

const tracks = [
  {
    title: "Creator quickstart",
    description:
      "Set up wallet, claim your handle, publish first paid link, and test payout.",
  },
  {
    title: "Payments deep dive",
    description:
      "Understand x402 verification, transaction reconciliation, and secure access tokens.",
  },
  {
    title: "Payout operations",
    description:
      "Best practices for M-Pesa cashouts, fee transparency, and user support workflows.",
  },
]

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <section className="space-y-2">
        <Badge variant="outline">Learning hub</Badge>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Learn xpesa
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Structured learning tracks for creators, operators, and builders using
          xpesa V1.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {tracks.map((track) => (
          <Card key={track.title}>
            <CardHeader>
              <CardTitle className="text-xl">{track.title}</CardTitle>
              <CardDescription>{track.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Start track
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-xl border bg-muted/20 p-4 md:p-6">
        <h2 className="font-heading text-2xl font-semibold">Next steps</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Once your first link is live, review analytics weekly and tune pricing
          from transaction outcomes.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/links/create">Create a new link</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs">Open docs</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
