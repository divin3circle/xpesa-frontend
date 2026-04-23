"use client"

import { PayLinkPreviewCard } from "@/components/pay/pay-link-preview-card"
import { PayLinkTransactions } from "@/components/pay/pay-link-transactions"
import PayPreview from "@/components/pay/pay-preview";
import { PayPurchaseCard } from "@/components/pay/pay-purchase-card"

export default function PayPage() {

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <section className="space-y-2">
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
