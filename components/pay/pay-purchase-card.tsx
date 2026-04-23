"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { usePublicLink } from "@/hooks/use-public"

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
      <Card className="border-border/70">
        <CardContent className="flex min-h-[280px] items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
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
          Pay to unlock this creator content.
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
          <label htmlFor="amount" className="text-sm font-medium">
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
          <Button onClick={onConfirmPayment}>Confirm payment</Button>
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
