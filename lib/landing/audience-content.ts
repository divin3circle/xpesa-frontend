import type { LucideIcon } from "lucide-react"
import campusStudentsImage from "@/public/campusimg.png"
import twitterEducatorsImage from "@/public/twitter.png"
import freelancersImage from "@/public/freelance.png"
import coachesImage from "@/public/coachesimg.png"

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
  bgColor: "red-500" | "green-500" | "purple-500" | "background"
  text: "white" | "foreground"
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
      imageSrc: campusStudentsImage.src,
      imageAlt: "Students studying with notebooks",
      bgColor: "red-500",
      text: "white",
    },
    {
      title: "Twitter/X educators",
      description:
        "Finance, career, and growth educators with active audiences already asking for M-Pesa tip options.",
      href: "#",
      icon: MessageSquareShare,
      imageSrc: twitterEducatorsImage.src,
      imageAlt: "Phone showing social media feed",
      bgColor: "purple-500",
      text: "white",
    },
    {
      title: "Freelancers selling templates",
      description:
        "Developers, designers, and VAs monetizing reusable templates, packs, and digital assets.",
      href: "#",
      icon: BriefcaseBusiness,
      imageSrc: freelancersImage.src,
      imageAlt: "Freelancer coding on laptop",
      bgColor: "background",
      text: "foreground",
    },
    {
      title: "Coaches and consultants",
      description:
        "Micro-consultants like nutritionists, fitness coaches, and therapists selling one resource or receiving appreciation tips.",
      href: "#",
      icon: Stethoscope,
      imageSrc: coachesImage.src,
      imageAlt: "Coach consulting a client",
      bgColor: "green-500",
      text: "white",
    },
  ] as AudienceArchetype[],
}
