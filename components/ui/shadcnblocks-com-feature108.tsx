import * as React from "react"
import * as Tabs from "@radix-ui/react-tabs"
import { Layout, Pointer, Wallet } from "lucide-react"
import { motion } from "motion/react"
import Image from "next/image"
import dashboardImage from "@/public/dashboard.avif"
import socialImage from "@/public/share.avif"
import paymentImage from "@/public/payment.jpg"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AsteriskRevealHeading } from "@/components/ui/asterisk-reveal-heading"
import { cn } from "@/lib/utils"

export interface TabContent {
  badge: string
  title: string
  description: string
  buttonText: string
  imageSrc: string
  imageAlt: string
}

export interface Tab {
  value: string
  icon: React.ReactNode
  label: string
  shortDescription: string
  content: TabContent
}

interface Feature108Props {
  badge?: string
  heading?: string
  description?: string
  tabs?: Tab[]
}

const defaultTabs: Tab[] = [
  {
    value: "create",
    icon: <Layout className="size-4 shrink-0" />,
    label: "Create paid link",
    shortDescription:
      "Paste any destination link, set a price, and choose how long access should last.",
    content: {
      badge: "Step 1",
      title: "Create a link and set your price",
      description:
        "Choose gate or tip mode, add your destination URL, and publish instantly with your custom xpesa link.",
      buttonText: "Create first link",
      imageSrc: dashboardImage.src,
      imageAlt: "Creator dashboard setup",
    },
  },
  {
    value: "share",
    icon: <Pointer className="size-4 shrink-0" />,
    label: "Share with audience",
    shortDescription:
      "Drop your xpesa URL in bio, X thread, WhatsApp, Telegram, or newsletter.",
    content: {
      badge: "Step 2",
      title: "Share once, no manual follow-up",
      description:
        "Your audience pays through the link, and access is delivered automatically without DMs or screenshot verification.",
      buttonText: "See buyer flow",
      imageSrc: socialImage.src,
      imageAlt: "Social sharing on mobile",
    },
  },
  {
    value: "withdraw",
    icon: <Wallet className="size-4 shrink-0" />,
    label: "Get paid and withdraw",
    shortDescription:
      "Receive USDC and withdraw to M-Pesa with one click when you are ready.",
    content: {
      badge: "Step 3",
      title: "Get paid in USDC and withdraw to M-Pesa",
      description:
        "Payments settle on Base, then you offramp through Kotani Pay into your M-Pesa number without exchange complexity.",
      buttonText: "View payout flow",
      imageSrc: paymentImage.src,
      imageAlt: "Mobile payout confirmation",
    },
  },
]

export function Feature108({
  badge = "How it works",
  heading = "From link to payout in three steps",
  description = "A simple creator flow built for speed: create, share, and get paid.",
  tabs = defaultTabs,
}: Feature108Props) {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-sans text-xs font-semibold">{badge}</p>
          <AsteriskRevealHeading
            as="h2"
            delayMs={760}
            text={heading}
            className="max-w-2xl font-heading text-3xl font-bold tracking-tight md:text-5xl"
          />
          <p className="max-w-2xl font-sans text-foreground/70">
            {description}
          </p>
        </div>

        <Tabs.Root defaultValue={tabs[0]?.value} className="mt-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Tabs.List className="grid gap-4 md:grid-cols-3">
              {tabs.map((tab, index) => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "group cursor-pointer rounded-2xl border border-muted-foreground/50 p-5 text-left transition-all outline-none",
                    "data-[state=active]:border-chart-1 data-[state=active]:bg-chart-1/10"
                  )}
                >
                  <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="grid size-8 place-items-center group-data-[state=active]/trigger:text-chart-1">
                      {tab.icon}
                    </span>
                    <span className="font-sans text-xs text-foreground/70 uppercase">
                      Step {index + 1}
                    </span>
                  </div>
                  <p className="font-heading text-lg font-semibold text-foreground group-data-[state=active]/trigger:text-chart-1">
                    {tab.label}
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-foreground/70 group-data-[state=active]/trigger:text-background">
                    {tab.shortDescription}
                  </p>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </motion.div>

          <motion.div
            className="mt-8 p-6 lg:p-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
          >
            {tabs.map((tab) => (
              <Tabs.Content
                key={tab.value}
                value={tab.value}
                className="grid items-center gap-8 data-[state=inactive]:hidden lg:grid-cols-2"
              >
                <div className="flex flex-col gap-5">
                  <Badge
                    variant="outline"
                    className="w-fit bg-background/70 text-xs uppercase"
                  >
                    {tab.content.badge}
                  </Badge>
                  <AsteriskRevealHeading
                    as="h3"
                    delayMs={900}
                    text={tab.content.title}
                    className="font-heading text-3xl font-semibold md:text-4xl"
                  />
                  <p className="font-sans text-foreground/70 lg:text-lg">
                    {tab.content.description}
                  </p>
                  <Button className="mt-1 w-fit" size="lg">
                    {tab.content.buttonText}
                  </Button>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-chart-1 p-1">
                  <Image
                    src={tab.content.imageSrc}
                    alt={tab.content.imageAlt}
                    width={1200}
                    height={800}
                    className="h-72 w-full rounded-xl object-cover md:h-80"
                  />
                </div>
              </Tabs.Content>
            ))}
          </motion.div>
        </Tabs.Root>
      </div>
    </section>
  )
}
