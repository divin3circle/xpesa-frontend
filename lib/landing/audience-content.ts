import type { LucideIcon } from "lucide-react"

import {
  BookOpenText,
  BriefcaseBusiness,
  MessageSquareShare,
  Stethoscope,
} from "lucide-react"

export type AudienceArchetype = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  imageSrc: string
  imageAlt: string
}

export const audienceContent = {
  badge: "Who it is for",
  heading: "Built for creators who feel the payment pain most",
  description:
    "Our earliest users are practical sellers who already have demand and need a better way to get paid than manual M-Pesa DMs.",
  archetypes: [
    {
      title: "Campus tutors",
      description:
        "Students selling notes, past papers, and revision packs around Kenyatta, UoN, Strathmore, and USIU.",
      href: "#",
      icon: BookOpenText,
      imageSrc:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
      imageAlt: "Students studying with notebooks",
    },
    {
      title: "Twitter/X educators",
      description:
        "Finance, career, and growth educators with active audiences already asking for M-Pesa tip options.",
      href: "#",
      icon: MessageSquareShare,
      imageSrc:
        "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800&q=80",
      imageAlt: "Phone showing social media feed",
    },
    {
      title: "Freelancers selling templates",
      description:
        "Developers, designers, and VAs monetizing reusable templates, packs, and digital assets.",
      href: "#",
      icon: BriefcaseBusiness,
      imageSrc:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      imageAlt: "Freelancer coding on laptop",
    },
    {
      title: "Coaches and consultants",
      description:
        "Micro-consultants like nutritionists, fitness coaches, and therapists selling one resource or receiving appreciation tips.",
      href: "#",
      icon: Stethoscope,
      imageSrc:
        "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=800&q=80",
      imageAlt: "Coach consulting a client",
    },
  ] as AudienceArchetype[],
}
