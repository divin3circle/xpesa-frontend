"use client"
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
import { BrandLogo } from "@/components/landing/brand-logo"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { YoutubeIcon } from "@hugeicons/core-free-icons"

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
              Get Started with XPesa in minutes
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Learn to quickly create and share content behind a paywall or
              withdraw your earnings to local fiat accounts.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild>
                <Link href="https://xpesa.mintlify.app/">
                  Full Documentation
                </Link>
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
                  15 Minutes
                </Badge>
                <p className="text-xs font-medium text-chart-2">Track 01</p>
              </div>
              <CardTitle className="text-xl">Link Creation</CardTitle>
              <CardDescription>
                Follow along as we build a link from scratch, set up a paywall,
                and share it with the world.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                className="w-full cursor-pointer group-hover:scale-105"
                onClick={() =>
                  window.open(
                    "https://youtu.be/uOAHL-cOAlE?si=pqrv3tS2XJZ6Qvor"
                  )
                }
              >
                <HugeiconsIcon icon={YoutubeIcon} className="mr-2 h-4 w-4" />
                Watch video
              </Button>
            </CardContent>
          </Card>

          <Card className="border-dashed border-border/80 bg-card/40">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline" className="rounded-full">
                  5 Minutes
                </Badge>
                <p className="text-xs font-medium text-muted-foreground">
                  Track 02
                </p>
              </div>
              <CardTitle className="text-xl">Onboarding Setup</CardTitle>
              <CardDescription>
                Learn how to set up your payout details, a wallet, and withdraw
                your first earnings.
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
                  7 Minutes
                </Badge>
                <p className="text-xs font-medium text-muted-foreground">
                  Track 03
                </p>
              </div>
              <CardTitle className="text-xl">Invest Earnings</CardTitle>
              <CardDescription>
                Not eager to withdraw? See how to use your Avalanche earnings to
                grow your USDC.
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
              <Badge className="rounded-full">Introduction</Badge>
              <Badge variant="outline" className="rounded-full">
                15 minutes
              </Badge>
              <Badge variant="outline" className="rounded-full">
                Beginner friendly
              </Badge>
            </div>

            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Get to know Xpesa
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Xpesa is a creator monetization platform for African creators. It
              lets creators create paid content gates and tip links, accept USDC
              payments through Avalanche smart accounts, and withdraw earnings
              to local fiat through an offramp partner.
            </p>

            <div className="overflow-hidden rounded-2xl border bg-background">
              <div className="aspect-video w-full">
                <iframe
                  width="560"
                  height="315"
                  className="h-full w-full rounded-2xl"
                  src="https://www.youtube.com/embed/uOAHL-cOAlE?si=8oBIyC7gCTt5w_hd"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Step 1</p>
                <p className="text-sm font-medium">Setup Account</p>
              </div>
              <div className="rounded-xl border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Step 2</p>
                <p className="text-sm font-medium">Create Content Link</p>
              </div>
              <div className="rounded-xl border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Step 3</p>
                <p className="text-sm font-medium">Share Link & Earn</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Link
              href="/docs"
              rel="noopener noreferrer"
              target="_blank"
              className="mb-2 overflow-hidden"
            >
              <Image
                src="/share.avif"
                alt="Documentation landing page."
                width={1200}
                height={800}
                className="h-44 w-full rounded-2xl object-cover"
                priority
              />
            </Link>

            <Link
              href="https://xpesa.mintlify.app/creators/creating-your-account"
              rel="noopener noreferrer"
              target="_blank"
              className="overflow-hidden"
            >
              <Image
                src="/banner2.jpg"
                alt="Error workflow illustration"
                width={1200}
                height={800}
                className="h-44 w-full rounded-2xl object-cover"
              />
            </Link>

            <Card className="border-chart-1/30 bg-chart-1/5">
              <CardHeader>
                <CardTitle className="text-lg">
                  Account setup checklist
                </CardTitle>
                <CardDescription>
                  As a creator, you need to ensure your account is fully set up
                  to receive payments and withdraw earnings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>1. Confirm your email address.</p>
                <p>2. Add and confirm your wallet and mobile information.</p>
                <p>3. Ensure profile details are accurate and up to date.</p>
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
              <Link href="/docs">See docs</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
