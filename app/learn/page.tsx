import Link from "next/link"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BrandLogo } from "@/components/landing/brand-logo"

export default function LearnPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-48 h-112 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--chart-2)_20%,transparent),transparent_55%),radial-gradient(circle_at_80%_0%,color-mix(in_oklab,var(--chart-1)_26%,transparent),transparent_60%)]" />

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-8 md:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-6 shadow-sm backdrop-blur md:p-10">
          <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-chart-1/25 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-chart-2/20 blur-3xl" />

          <div className="relative space-y-4">
            <BrandLogo tone="default" />
            <Badge className="rounded-full px-3 py-1">
              Getting Started Hub
            </Badge>
            <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight md:text-5xl">
              Learn xpesa faster with practical tracks
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Start with quick, focused lessons you can complete in minutes. The{" "}
              <span className="font-medium text-foreground">Errors track</span>
              is live now with a guided video and field-tested fixes.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild>
                <Link href="#">Start Errors Track</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/links/create">
                  Create your next link
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="group border-chart-2/30 bg-card/70 transition-all hover:-translate-y-0.5 hover:border-chart-2/60">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="secondary" className="rounded-full">
                  Live Now
                </Badge>
                <p className="text-xs font-medium text-chart-2">Track 01</p>
              </div>
              <CardTitle className="text-xl">Error recovery track</CardTitle>
              <CardDescription>
                Learn the fastest path to identify, verify, and fix common setup
                and runtime issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="#">Open Track</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-dashed border-border/80 bg-card/40">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline" className="rounded-full">
                  Placeholder
                </Badge>
                <p className="text-xs font-medium text-muted-foreground">
                  Track 02
                </p>
              </div>
              <CardTitle className="text-xl">Payments quick track</CardTitle>
              <CardDescription>
                Coming next: embedded walkthroughs for payment states,
                confirmations, and edge-case handling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" disabled className="w-full">
                Coming soon
              </Button>
            </CardContent>
          </Card>

          <Card className="border-dashed border-border/80 bg-card/40">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline" className="rounded-full">
                  Placeholder
                </Badge>
                <p className="text-xs font-medium text-muted-foreground">
                  Track 03
                </p>
              </div>
              <CardTitle className="text-xl">Growth and optimization</CardTitle>
              <CardDescription>
                Coming next: pricing tests, conversion improvements, and
                recurring optimization loops.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" disabled className="w-full">
                Coming soon
              </Button>
            </CardContent>
          </Card>
        </section>

        <section
          id="errors-track"
          className="grid gap-4 rounded-3xl border bg-card/70 p-4 shadow-sm md:grid-cols-5 md:p-6"
        >
          <div className="space-y-4 md:col-span-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full">Errors Track</Badge>
              <Badge variant="outline" className="rounded-full">
                12 minutes
              </Badge>
              <Badge variant="outline" className="rounded-full">
                Beginner friendly
              </Badge>
            </div>

            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              From confusion to fix, quickly
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              This track gives your team a clean troubleshooting flow:
              reproduce, classify, verify, and resolve with confidence.
            </p>

            <div className="overflow-hidden rounded-2xl border bg-background">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="XPesa Errors Track Introduction"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Step 1</p>
                <p className="text-sm font-medium">Capture the symptom</p>
              </div>
              <div className="rounded-xl border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Step 2</p>
                <p className="text-sm font-medium">Run focused checks</p>
              </div>
              <div className="rounded-xl border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Step 3</p>
                <p className="text-sm font-medium">Apply and verify fix</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <div className="overflow-hidden rounded-2xl border">
              <Image
                src="/error1.avif"
                alt="Error diagnostics panel illustration"
                width={1200}
                height={800}
                className="h-44 w-full object-cover"
                priority
              />
            </div>

            <div className="overflow-hidden rounded-2xl border">
              <Image
                src="/error2.avif"
                alt="Error workflow illustration"
                width={1200}
                height={800}
                className="h-44 w-full object-cover"
              />
            </div>

            <Card className="border-chart-1/30 bg-chart-1/5">
              <CardHeader>
                <CardTitle className="text-lg">
                  Ready-to-use checklist
                </CardTitle>
                <CardDescription>
                  Use this flow every time you see a critical issue before
                  launch.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>1. Confirm reproduction path and environment.</p>
                <p>2. Validate auth/session and API response status.</p>
                <p>3. Re-test with clean cache and expected user role.</p>
                <p>4. Ship fix only after regression check passes.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="rounded-2xl border bg-muted/20 p-4 md:p-6">
          <h3 className="font-heading text-2xl font-semibold">Next steps</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Finish the Errors track, publish one link, and then move into Docs
            to harden your production workflow.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/links/create">Create a new link</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs">Read docs</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
