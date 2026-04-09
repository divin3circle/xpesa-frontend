"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

type LinkType = "gate" | "document" | "pack" | "tip"
const activeLinks = [
  { title: "React Native Crash Course", type: "GATE", price: "$12" },
  { title: "Buy me chai", type: "TIP", price: "Any amount" },
  { title: "Design teardown notes", type: "GATE", price: "$4" },
]
type PublicLinkPayload = {
  title: string
  description: string
  price?: string
  type: LinkType
  pageCount?: number
  fileCount?: number
  fileBreakdown?: string
  thumbnailUrl?: string
  suggestedAmount?: string
  thankYouMessage?: string
  expiryType?: string
  maxViews?: number
}

const fallbackByType: Record<LinkType, PublicLinkPayload> = {
  gate: {
    title: "React Native Crash Course",
    description: "Pay to unlock the creator link.",
    price: "12.00",
    type: "gate",
  },
  document: {
    title: "Design teardown notes",
    description: "Secure in-browser document viewing.",
    price: "4.00",
    type: "document",
    pageCount: 24,
    expiryType: "30 days",
    maxViews: 5,
  },
  pack: {
    title: "KCSE Revision Pack",
    description: "Multi-file bundle with one price.",
    price: "16.00",
    type: "pack",
    fileCount: 3,
    fileBreakdown: "2 PDF • 1 Image",
    expiryType: "30 days",
    maxViews: 5,
  },
  tip: {
    title: "Buy me chai",
    description: "Support my work.",
    type: "tip",
    suggestedAmount: "2.00",
    thankYouMessage: "Thank you for your support!",
  },
}

export default function PayPage() {
  const params = useParams<{ linkId: string }>()
  const linkId = params?.linkId

  const [type, setType] = useState<LinkType>("gate")
  const [metadata, setMetadata] = useState<PublicLinkPayload>(
    fallbackByType.gate
  )
  const [amount, setAmount] = useState("12.00")
  const [successToken, setSuccessToken] = useState("")

  const accessControlPills = useMemo(() => {
    if (type !== "document" && type !== "pack") return []

    const pills = ["🔒 Wallet-bound"]
    if (metadata.expiryType) pills.push(`⏱ ${metadata.expiryType}`)
    if (metadata.maxViews) pills.push(`👁 Max ${metadata.maxViews} opens`)
    return pills
  }, [metadata.expiryType, metadata.maxViews, type])

  const loadLink = async (nextType: LinkType) => {
    setType(nextType)
    try {
      const response = await fetch(`/api/public/pay/${linkId}?type=${nextType}`)
      const payload = (await response.json()) as PublicLinkPayload
      setMetadata(payload)
      setAmount(payload.suggestedAmount ?? payload.price ?? "")
    } catch {
      const fallback = fallbackByType[nextType]
      setMetadata(fallback)
      setAmount(fallback.suggestedAmount ?? fallback.price ?? "")
    }
  }

  const onConfirmPayment = () => {
    setSuccessToken("demo-access-token")
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <section className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Pay creator
        </h1>
        <p className="text-sm text-muted-foreground">
          Link id: {linkId}. Choose mode preview to test the fan payment states.
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        <Button
          variant={type === "gate" ? "default" : "secondary"}
          onClick={() => loadLink("gate")}
        >
          Gate
        </Button>
        <Button
          variant={type === "document" ? "default" : "secondary"}
          onClick={() => loadLink("document")}
        >
          Document
        </Button>
        <Button
          variant={type === "pack" ? "default" : "secondary"}
          onClick={() => loadLink("pack")}
        >
          Pack
        </Button>
        <Button
          variant={type === "tip" ? "default" : "secondary"}
          onClick={() => loadLink("tip")}
        >
          Tip
        </Button>
      </section>

      <section className="flex w-full flex-col items-center gap-2 md:flex-row">
        <div className="lg:col-span-3">
          <div className="space-y-4">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div>
                  <p className="font-medium">Wanjiru M.</p>
                  <p className="text-xs text-muted-foreground">@wanjiru</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Product designer sharing resources, templates, and practical
                guides for early creators.
              </p>
              <div className="space-y-2">
                {activeLinks.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type}
                      </p>
                    </div>
                    <Badge>{item.price}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Card className="border-chart-1 shadow-chart-1">
          <CardHeader>
            <CardTitle>{metadata.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(type === "document" || type === "pack") && (
              <div className="rounded-xl border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {type === "document"
                    ? `${metadata.pageCount ?? 0} pages`
                    : `${metadata.fileCount ?? 0} files — ${metadata.fileBreakdown ?? ""}`}
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {metadata.description}
            </p>
            {type === "tip" || type === "gate" ? (
              <div className="flex w-full flex-col items-center justify-center">
                <Image
                  src="/withdraw.webp"
                  alt="Wallet"
                  width={200}
                  height={100}
                  className="w-44 rounded-2xl align-middle"
                />
              </div>
            ) : null}

            {accessControlPills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {accessControlPills.map((pill) => (
                  <Badge key={pill} variant="secondary">
                    {pill}
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                {type === "tip" ? "Tip amount (USDC)" : "Amount (USDC)"}
              </label>
              <Input
                id="amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
            </div>

            {!successToken ? (
              <Button onClick={onConfirmPayment}>Confirm payment</Button>
            ) : (
              <div className="space-y-3 rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Payment successful.
                </p>
                {type === "document" && (
                  <Button asChild>
                    <Link href={`/view/${successToken}`}>Open document</Link>
                  </Button>
                )}
                {type === "pack" && (
                  <Button asChild>
                    <Link href={`/pack/${successToken}`}>Open pack</Link>
                  </Button>
                )}
                {type === "gate" && (
                  <p className="text-sm">
                    Unlocked URL would render here in the gate flow.
                  </p>
                )}
                {type === "tip" && (
                  <p className="text-sm">
                    {metadata.thankYouMessage ?? "Thank you for your support!"}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
