"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, Clock3, Coins, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicLink } from "@/hooks/use-public"
import { envConfig } from "@/lib/env"

function formatUsdc(value: number | null | undefined) {
  const amount = Number(value ?? 0)
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatExpiry(value: string | null | undefined) {
  if (!value || value === "forever") return "Forever"
  if (value === "one_time") return "One-time access"
  return value.toUpperCase()
}

function buildAccessRules(
  link: NonNullable<ReturnType<typeof usePublicLink>["data"]>["link"]
) {
  const rules = [`Expiry: ${formatExpiry(link.access_expiry_type)}`]

  if (link.access_wallet_binding) rules.push("Wallet-bound")
  if (link.access_max_views) rules.push(`Max ${link.access_max_views} opens`)
  if (link.doc_download_blocked) rules.push("Download blocked")
  if (link.type === "document" || link.type === "pack") {
    rules.push("Protected viewer")
  }

  return rules
}

export function PaymentAccessDetails() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId
  const { data, isLoading, error } = usePublicLink(linkId)

  const link = data?.link
  const amount = Number(link?.price_usdc ?? link?.suggested_amount_usdc ?? 0)
  const fee = amount * 0.05
  const creatorNet = Math.max(amount - fee, 0)

  const accessRules = useMemo(() => {
    if (!link) return []
    return buildAccessRules(link)
  }, [link])

  if (isLoading) {
    return <Skeleton className="h-52 w-full rounded-2xl" />
  }

  if (error || !link) {
    return null
  }

  if (amount <= 0) {
    return null
  }

  return (
    <Card className="border-none px-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Payment & access details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Coins, label: "Pay", value: "USDC or Mobile" },
              {
                icon: Clock3,
                label: "Settle",
                value: envConfig.PAYMENT_NETWORK_LABEL,
              },
              { icon: CheckCircle2, label: "Creator", value: "95% net" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/70 p-3"
                >
                  <Icon className="mb-2 size-4 text-primary" />
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm font-medium">{item.value}</p>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {accessRules.map((rule) => (
              <Badge key={rule} variant="secondary">
                <ShieldCheck className="mr-1 size-3" />
                {rule}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border/70 bg-muted/25 p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">
              {amount > 0 ? formatUsdc(amount) : "Any amount"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-muted-foreground">XPesa fee</span>
            <span className="font-medium">
              {amount > 0 ? formatUsdc(fee) : "5%"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Creator receives</span>
            <span className="font-medium">
              {amount > 0 ? formatUsdc(creatorNet) : "95% of payment"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Content type</span>
            <span className="font-medium capitalize">{link.type}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
