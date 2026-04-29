"use client"
import { PayLinkPreviewCard } from "@/components/pay/pay-link-preview-card"
import { PayLinkTransactions } from "@/components/pay/pay-link-transactions"
import PayPreview from "@/components/pay/pay-preview"
import { PayPurchaseCard } from "@/components/pay/pay-purchase-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"

export default function PayPage() {
  const router = useRouter()
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <section className="space-y-2">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="group px-2 text-xs text-muted-foreground"
        >
          <HugeiconsIcon
            icon={ArrowLeft}
            className="transition-transform duration-200 group-hover:-translate-x-1.5"
          />
          <span>Back to Creator</span>
        </Button>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Explore & Pay
        </h1>
        <p className="text-sm text-muted-foreground">
          Preview link details and purchase access.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <PayLinkPreviewCard />
        <PayPurchaseCard />
      </section>
      <PayPreview />
      <PayLinkTransactions />
    </div>
  )
}
