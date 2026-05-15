import * as React from "react"
import { Layout, Pointer, Wallet } from "lucide-react"

import {
  Feature108,
  type Tab,
} from "@/components/ui/shadcnblocks-com-feature108"
import { howItWorksContent } from "@/lib/landing/how-it-works-content"

const iconMap = {
  create: <Layout className="size-4 shrink-0" />,
  share: <Pointer className="size-4 shrink-0" />,
  withdraw: <Wallet className="size-4 shrink-0" />,
} as const

export function HowItWorks() {
  const tabs: Tab[] = howItWorksContent.steps.map((step) => ({
    value: step.value,
    icon: iconMap[step.icon],
    label: step.label,
    shortDescription: step.shortDescription,
    content: step.content,
  }))

  return (
    <section id="solution">
      <Feature108
        badge={howItWorksContent.badge}
        heading={howItWorksContent.heading}
        description={howItWorksContent.description}
        tabs={tabs}
      />
    </section>
  )
}
