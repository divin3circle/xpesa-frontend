export type HeroNavItem = {
  label: string
  href: string
}

export type HeroStat = {
  label: string
  value: string
}

export const heroNavItems: HeroNavItem[] = [
  { label: "Overview", href: "#overview" },
  { label: "How It Works", href: "#solution" },
  { label: "Models", href: "#models" },
]

export const heroAnnouncement = {
  title: "Now in build",
  body: "Link Gate and Tip mode for African creators.",
  href: "#overview",
  cta: "Read product thesis",
}

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
    value: "x402 triggered stablecoin settlements",
  },
  { label: "Core Models", value: "Premium link Gate and Custom Tipping" },
  { label: "Custody", value: "Creators retain 100% control of their funds" },
  {
    label: "Off-chain Redemption",
    value: "Off-ramp SDKs to local payment systems",
  },
]
