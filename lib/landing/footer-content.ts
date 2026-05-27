import {
  CircleDollarSign,
  FileText,
  HelpCircle,
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
    label: "Resources",
    links: [
      {
        title: "Litepaper",
        href: "https://divin3circle.github.io/xpesa-litepaper/",
        icon: Landmark,
      },
      {
        title: "Fees",
        href: "https://xpesa.mintlify.app/payments/platform-fees",
        icon: CircleDollarSign,
      },
      {
        title: "References",
        href: "https://xpesa.mintlify.app/reference",
        icon: HelpCircle,
      },
    ],
  },
  {
    label: "Company",
    links: [
      {
        title: "Documentation",
        href: "https://xpesa.mintlify.app",
        icon: FileText,
      },
      {
        title: "Policies & Terms",
        href: "/policies-and-terms",
        icon: ShieldCheck,
      },
      {
        title: "Contact",
        href: "https://xpesa.mintlify.app/reference/contact-and-press",
        icon: ShieldCheck,
      },
    ],
  },
]
