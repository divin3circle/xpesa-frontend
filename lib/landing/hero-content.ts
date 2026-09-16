export type HeroNavItem = {
  label: string
  href: string
}

export type HeroStat = {
  label: string
  value: string
}

export const heroNavItems: HeroNavItem[] = [
  { label: "How It Works", href: "#solution" },
  { label: "Modes", href: "#modes" },
  { label: "Use Cases", href: "#usecases" },
]

export const heroCopy = {
  eyebrow: "Monetize what you know, in Africa",
  headingLead: "Turn your content and courses into",
  headingAccent: "income",
  headingTail: "— paid straight to M-Pesa.",
  description:
    "Sell documents, packs, and gated resources, or take tips — and add quizzes and rewards that keep learners coming back. Get paid in USDC and cash out straight to M-Pesa. A flat 12%, no middlemen, no payment headaches.",
  secondaryCta: "See the V1 scope",
}

export const heroStats: HeroStat[] = [
  {
    label: "On-Chain Settlement",
    value: "Smart account stablecoin(USDC) settlements",
  },
  { label: "Core Models", value: "Sell documents, packs, gated links, and tips" },
  { label: "Custody", value: "Creators retain 100% control of their funds" },
  {
    label: "Off-chain Redemption",
    value: "Off-ramp railways to local payment systems",
  },
]
