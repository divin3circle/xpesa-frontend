import {
  BookOpenText,
  CircleDollarSign,
  ExternalLink,
  FileText,
  HandCoins,
  HelpCircle,
  Home,
  Landmark,
  ShieldCheck,
} from "lucide-react"

export type FooterLink = {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

export type FooterLinkGroup = {
  label: string
  links: FooterLink[]
}

export const footerSocialLinks = [
  { title: "Twitter/X", href: "#", icon: ExternalLink },
  { title: "LinkedIn", href: "#", icon: ExternalLink },
  { title: "YouTube", href: "#", icon: ExternalLink },
]

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    label: "Product",
    links: [
      { title: "How it works", href: "#how-it-works", icon: Home },
      { title: "Modes", href: "#modes", icon: HandCoins },
      { title: "Pricing", href: "#pricing", icon: CircleDollarSign },
      { title: "Who it is for", href: "#who-for", icon: BookOpenText },
    ],
  },
  {
    label: "Payouts",
    links: [
      { title: "M-Pesa flow", href: "#cta", icon: Landmark },
      { title: "Fees", href: "#pricing", icon: CircleDollarSign },
      { title: "Status", href: "#", icon: HelpCircle },
    ],
  },
  {
    label: "Company",
    links: [
      { title: "Documentation", href: "#", icon: FileText },
      { title: "Terms", href: "#", icon: ShieldCheck },
      { title: "Privacy", href: "#", icon: ShieldCheck },
    ],
  },
]
