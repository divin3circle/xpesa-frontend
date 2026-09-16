"use client"

import React from "react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DocumentCodeIcon,
  Link01Icon,
  Package01Icon,
  TipsIcon,
} from "hugeicons-react"

import type { LinkMode } from "./types"

const modeCards: Array<{
  mode: LinkMode
  emoji: React.ReactNode
  title: string
  subtitle: string
}> = [
  {
    mode: "gate",
    emoji: <Link01Icon />,
    title: "Gate a link",
    subtitle: "Fan pays to unlock your a URL with premium content.",
  },
  {
    mode: "document",
    emoji: <DocumentCodeIcon />,
    title: "Upload a file",
    subtitle: "Single file up to 50MB with secured access.",
  },
  {
    mode: "pack",
    emoji: <Package01Icon />,
    title: "Upload a file pack",
    subtitle: "Up to 3 files, 150MB total.",
  },
  {
    mode: "tip",
    emoji: <TipsIcon />,
    title: "Accept a tip",
    subtitle: "Fan pays what they want. No content needed.",
  },
]

export function ModeCards({
  mode,
  setMode,
}: {
  mode: LinkMode
  setMode: (mode: LinkMode) => void
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {modeCards.map((card) => (
        <Card
          key={card.mode}
          className={`cursor-pointer border transition-colors ${
            mode === card.mode
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-foreground/5"
          }`}
          onClick={() => setMode(card.mode)}
        >
          <CardHeader className="space-y-1">
            <CardTitle className="flex gap-1 font-heading text-lg">
              <span className="mr-2" aria-hidden>
                {card.emoji}
              </span>
              {card.title}
            </CardTitle>
            <CardDescription>{card.subtitle}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </section>
  )
}
