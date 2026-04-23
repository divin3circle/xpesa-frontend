"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { usePublicLink } from "@/hooks/use-public"
import Image from "next/image"

function formatUsdc(value: number | null) {
  if (!value || value <= 0) return "0.00"

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function PayPurchaseCard() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId

  const { data, isLoading, error } = usePublicLink(linkId)

  const [successToken, setSuccessToken] = useState("")
  const [amount, setAmount] = useState("")

  const link = data?.link

  const accessPills = useMemo(() => {
    if (!link) return []

    const pills: string[] = []
    if (link.access_wallet_binding) pills.push("Wallet-bound")
    if (link.access_expiry_type)
      pills.push(`Expiry: ${link.access_expiry_type}`)
    if (link.access_max_views) pills.push(`Max opens: ${link.access_max_views}`)
    return pills
  }, [link])

  useEffect(() => {
    if (!link) return
    if (amount) return
    setAmount(formatUsdc(link.suggested_amount_usdc ?? link.price_usdc))
  }, [amount, link])

  const onConfirmPayment = () => {
    setSuccessToken("demo-access-token")
  }

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col justify-between gap-2 md:flex-row md:items-center">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !link) {
    return (
      <Card className="border-border/70">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Could not load payment details.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-xl">Purchase Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You will be able to view the content according to the access
          conditions set by the creator.
        </p>

        {accessPills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {accessPills.map((pill) => (
              <Badge key={pill} variant="secondary">
                {pill}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="amount" className="mb-1 text-sm font-medium">
            Amount (USDC)
          </label>
          <Input
            id="amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            readOnly={link.type !== "tip"}
          />
        </div>

        {!successToken ? (
          <>
            <Button onClick={onConfirmPayment}>Confirm payment</Button>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1">
                <Image src="/usdc.svg" alt="USDC" width={16} height={16} />
                <span className="text-sm font-semibold text-muted-foreground">
                  USDC
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1">
                <Image src="/usdt.svg" alt="USDC" width={16} height={16} />
                <span className="text-sm font-semibold text-muted-foreground">
                  USDT
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1">
                <Image src="/mpesa.png" alt="USDC" width={16} height={16} />
                <span className="text-sm font-semibold text-muted-foreground">
                  Mobile Money
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3 rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Payment successful.</p>
            {link.type === "document" && (
              <Button asChild>
                <Link href={`/view/${successToken}`}>Open document</Link>
              </Button>
            )}
            {link.type === "pack" && (
              <Button asChild>
                <Link href={`/pack/${successToken}`}>Open pack</Link>
              </Button>
            )}
            {link.type === "gate" && (
              <p className="text-sm">Unlocked URL flow is ready to connect.</p>
            )}
            {link.type === "tip" && (
              <p className="text-sm">
                {link.thank_you_message ?? "Thank you for your support!"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
