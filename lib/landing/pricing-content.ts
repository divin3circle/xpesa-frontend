import { Check, Flame, Sparkles, Wallet2 } from "lucide-react"

export const pricingContent = {
  badge: {
    icon: Sparkles,
    text: "All you need.",
  },
  heading: "Free to start. We take 5% on transactions. That's it.",
  subtitle:
    "No monthly plans, no locked tiers. Start publishing links immediately and pay only when money comes in.",
  price: {
    current: "5%",
    original: "No subscription",
    discount: "Free to start",
  },
  benefits: [
    { text: "Launch with zero upfront cost", icon: Flame },
    { text: "One transparent transaction fee", icon: Wallet2 },
    { text: "No hidden plan upgrades in V1", icon: Check },
  ],
  featuresTitle: "Included FREE!",
  features: [
    { text: "Custom creator page at xpesa.com/[handle]" },
    { text: "Up to 5 active links (gate + tip combined)" },
    { text: "Both link modes: Gate and Tip" },
    { text: "Access expiry controls: one-time, timed, forever" },
    { text: "Basic dashboard: earnings, transactions, active links" },
    { text: "M-Pesa offramp via Kotani Pay" },
    { text: "AI link description writer (3 uses/day)" },
    { text: '"Powered by xpesa" branding on public/payment pages' },
    { text: "Transaction fee: 5%" },
  ],
  testimonials: [
    {
      id: 1,
      name: "Campus Tutor",
      role: "UoN student seller",
      content:
        "I only pay when I earn. That's what made me switch from manual M-Pesa screenshots.",
      rating: 5,
    },
    {
      id: 2,
      name: "X Educator",
      role: "Career creator",
      content:
        "The 5% fee is clear and predictable, and local payout is the part that matters most.",
      rating: 5,
    },
  ],
}
