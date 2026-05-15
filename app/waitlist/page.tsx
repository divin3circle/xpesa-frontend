"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import {
  ArrowRight,
  Check,
  CreditCard,
  FileText,
  Link2,
  Sparkles,
} from "lucide-react"

import { BrandLogo } from "@/components/landing/brand-logo"
import { Button } from "@/components/ui/button"
import {
  renderCanvas,
  ShineBorder,
  TypeWriter,
} from "@/components/ui/hero-designali"
import { TextGlitch } from "@/components/ui/text-glitch-effect"
import { useWaitlist } from "@/hooks/use-waitlist"
import LoadingSpinner from "@/components/ui/loading-spinner"

const creatorTypes = [
  "Digital Products",
  "Paid Communities",
  "Document Templates",
  "Coaching Materials",
  "Art and Music",
  "Educational Content",
]

const creatorTools = [
  {
    icon: Link2,
    title: "Sell from one link",
    body: "Publish gated links, drops, documents, and offers without stitching together five tools.",
  },
  {
    icon: CreditCard,
    title: "Accept fan payments",
    body: "Let supporters pay for content, services, and access with a checkout made for creator flows.",
  },
  {
    icon: FileText,
    title: "Deliver files cleanly",
    body: "Package resources, protect downloads, and keep buyers moving after payment.",
  },
]

export default function Waitlist() {
  const waitlist = useWaitlist()
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      await waitlist.mutateAsync({
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        creatorFocus: String(formData.get("creator-focus") || ""),
        notes: String(formData.get("first-sale") || ""),
      })

      setSubmitted(true)
      formData.forEach((_, key) => {
        const field = form.elements.namedItem(key)

        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement ||
          field instanceof HTMLSelectElement
        ) {
          field.value = ""
        }
      })
    } catch (submitError) {
      console.error(submitError)
    }
  }

  useEffect(() => {
    const cleanup = renderCanvas()

    return () => {
      cleanup()
    }
  }, [])

  return (
    <main className="relative isolate md:min-h-dvh md:overflow-hidden bg-background text-foreground">
      <canvas
        id="canvas"
        className="pointer-events-none absolute inset-0 z-0 mx-auto opacity-80"
      />

      <div className="absolute inset-x-0 top-0 -z-10 h-130 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_12%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_12%,transparent)_1px,transparent_1px)] mask-[radial-gradient(ellipse_80%_55%_at_50%_0%,#000_65%,transparent_110%)] bg-size-[3rem_3rem] opacity-25" />
      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <BrandLogo tone="default" />
          <Button asChild variant="outline">
            <Link href="/">
              Back home
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
              <Sparkles className="size-3.5 text-primary" />
              Creator waitlist is open
            </div>

            <div className="relative border bg-background/75 mask-[radial-gradient(80rem_50rem_at_center,white,transparent)] p-5 shadow-sm backdrop-blur-xl sm:p-8">
              <PlusMarker className="-top-5 -left-5" />
              <PlusMarker className="-bottom-5 -left-5" />
              <PlusMarker className="-top-5 -right-5" />
              <PlusMarker className="-right-5 -bottom-5" />

              <TextGlitch
                text="JOIN XPESA"
                hoverText="GET PAID IN USDC"
                delay={2}
                className="text-[clamp(3.3rem,11vw,8.5rem)]"
              />
              <p className="mt-4 max-w-2xl font-heading text-3xl leading-none font-black tracking-normal text-foreground sm:text-5xl lg:text-6xl">
                to share knowledge and niche content.
              </p>
            </div>

            <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              A monetization layer for creators selling{" "}
              <span className="font-semibold text-primary">
                <TypeWriter strings={creatorTypes} />
              </span>
              . Get early access to links, payments, content delivery, and
              creator analytics in one workspace.
            </p>
          </div>

          <div className="relative">
            <ShineBorder
              borderWidth={2}
              borderRadius={28}
              color={["#14b8a6", "#f43f5e", "#f59e0b", "#38bdf8"]}
              className="bg-background/70 p-1 backdrop-blur-xl dark:bg-background/70"
            >
              <form
                className="relative z-10 grid w-full gap-4 rounded-[1.35rem] border bg-background/50 p-5 text-left shadow-xl sm:p-6"
                onSubmit={handleSubmit}
              >
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Request early access
                  </p>
                  <h2 className="mt-2 font-heading text-3xl leading-tight font-black">
                    Tell us what you create.
                  </h2>
                </div>

                <label className="grid gap-2 text-sm font-medium">
                  Name
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    className="h-11 rounded-2xl border bg-background px-4 text-sm transition outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Email
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11 rounded-2xl border bg-background px-4 text-sm transition outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Creator focus
                  <select
                    required
                    name="creator-focus"
                    className="h-11 rounded-2xl border bg-background px-4 text-sm transition outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Pick your main lane
                    </option>
                    {creatorTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  What do you want to sell first?
                  <textarea
                    name="first-sale"
                    rows={4}
                    placeholder="A course, template pack, premium link, paid session..."
                    className="resize-none rounded-2xl border bg-background px-4 py-3 text-sm transition outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                  />
                </label>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-1 w-full flex items-center gap-1"
                  disabled={waitlist.isPending || submitted}
                >
                  {waitlist.isPending
                    ? <LoadingSpinner />
                    : submitted
                      ? "You are on the list"
                      : "Join the waitlist"}
                  {submitted ? (
                    <Check data-icon="inline-end" />
                  ) : (
                    <ArrowRight data-icon="inline-end" />
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  No spam. We will only reach out about early xpesa creator
                  access.
                </p>
              </form>
            </ShineBorder>
          </div>
        </div>

        <div className="grid gap-3 pb-8 md:grid-cols-3">
          {creatorTools.map((tool) => (
            <article
              key={tool.title}
              className="rounded-3xl border bg-background/75 p-5 backdrop-blur-md"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <tool.icon className="size-5" />
              </div>
              <h3 className="font-heading text-lg font-bold">{tool.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {tool.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function PlusMarker({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute flex size-10 items-center justify-center text-primary ${className || ""}`}
      aria-hidden="true"
    >
      <span className="absolute h-1 w-10 bg-current" />
      <span className="absolute h-10 w-1 bg-current" />
    </div>
  )
}
