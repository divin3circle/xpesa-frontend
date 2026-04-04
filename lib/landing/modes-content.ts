export type ModeCardContent = {
  value: string
  label: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  mockup: {
    heading: string
    subheading: string
    amount: string
    localAmount: string
    accent: string
    buttonLabel: string
  }
}

export const modesContent: ModeCardContent[] = [
  {
    value: "gate",
    label: "Gate a link",
    eyebrow: "For files, invites, and premium resources",
    title: "Set a price, share once, and let people pay to unlock the link.",
    description:
      "Use this when you want people to access a guide, folder, template, or private community after paying what you set.",
    bullets: [
      "Perfect for one-time access or paid downloads",
      "Keeps the link private until payment clears",
      "Works well for notes, invites, and gated resources",
    ],
    mockup: {
      heading: "KCSE Revision Pack",
      subheading: "Preview before unlock",
      amount: "USDC 3.50",
      localAmount: "KSH 500",
      accent: "Unlock after pay",
      buttonLabel: "Pay to access",
    },
  },
  {
    value: "tip",
    label: "Accept tips",
    eyebrow: "Support, appreciation, and direct fan backing",
    title: "Let people send support without needing to buy an item.",
    description:
      "Use this when your audience wants to show love, support your work, or add a voluntary tip alongside your content.",
    bullets: [
      "Great for creators with ongoing audiences",
      "No destination content required",
      "Best for bio links, newsletters, and shout-outs",
    ],
    mockup: {
      heading: "Buy me chai ☕",
      subheading: "Leave a note if you want",
      amount: "USDC 1 - 10",
      localAmount: "KSH 100 - 1000",
      accent: "Send support",
      buttonLabel: "Tip creator",
    },
  },
]
