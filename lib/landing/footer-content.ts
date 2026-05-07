import {
  BookOpenText,
  CircleDollarSign,
  FileText,
  HandCoins,
  HelpCircle,
  Home,
  Landmark,
  ShieldCheck,
} from "lucide-react"

import {
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

export type FooterLink = {
  title: string
  href: string
  icon?: ComponentType<{ className?: string }>
}

export type FooterLinkGroup = {
  label: string
  links: FooterLink[]
}

export const footerSocialLinks = [
  { title: "Twitter/X", href: "#", icon: IconBrandTwitter },
  { title: "LinkedIn", href: "#", icon: IconBrandLinkedin },
  { title: "YouTube", href: "#", icon: IconBrandYoutube },
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
