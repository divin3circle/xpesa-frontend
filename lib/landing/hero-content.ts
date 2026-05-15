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
  eyebrow: "Creator monetization for Africa",
  headingLead: "Your Audience is Global, Your",
  headingAccent: "Monetization",
  headingTail: "Should Be Too.",
  description:
    "Your content. Your price. Get paid in dollars, withdrawn to your local currency. No more middlemen, no more payment headaches.",
  secondaryCta: "See the V1 scope",
}

export const heroStats: HeroStat[] = [
  {
    label: "On-Chain Settlement",
    value: "Smart account stablecoin(USDC) settlements",
  },
  { label: "Core Models", value: "Paywall premium content and customizable tips" },
  { label: "Custody", value: "Creators retain 100% control of their funds" },
  {
    label: "Off-chain Redemption",
    value: "Off-ramp railways to local payment systems",
  },
]
