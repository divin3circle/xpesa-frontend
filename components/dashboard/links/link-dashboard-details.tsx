"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Link } from "@/lib/links/types"

function value(text?: string | number | null) {
  if (text === null || text === undefined || text === "") return "Not set"
  return String(text)
}

export function LinkDashboardDetails({ link }: { link: Link }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment & access</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Type" value={link.type} />
        <Detail
          label="Price"
          value={link.price_usdc ? `${link.price_usdc} USDC` : "Free"}
        />
        <Detail label="Access expiry" value={value(link.access_expiry_type)} />
        <Detail label="Max views" value={value(link.access_max_views)} />
        <Detail
          label="Wallet binding"
          value={link.access_wallet_binding ? "On" : "Off"}
        />
        <Detail
          label="IP binding"
          value={link.access_ip_binding ? "On" : "Off"}
        />
        <div className="sm:col-span-2">
          <Badge variant={link.is_active ? "default" : "secondary"}>
            {link.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
