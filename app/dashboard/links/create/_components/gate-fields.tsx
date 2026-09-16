"use client"

import { ChangeEvent } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function GateFields({
  destinationUrl,
  setDestinationUrl,
  gatePriceUsdc,
  setGatePriceUsdc,
  accessExpiryType,
  setAccessExpiryType,
  handleThumbnailChange,
}: {
  destinationUrl: string | undefined
  setDestinationUrl: (value: string) => void
  gatePriceUsdc: string
  setGatePriceUsdc: (value: string) => void
  accessExpiryType: string
  setAccessExpiryType: (value: string) => void
  handleThumbnailChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="destination">Destination URL</Label>
        <Input
          id="destination"
          placeholder="https://example.com/private-resource"
          value={destinationUrl}
          onChange={(event) => setDestinationUrl(event.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price-gate">Price (USDC)</Label>
          <Input
            id="price-gate"
            placeholder="12.00"
            value={gatePriceUsdc}
            onChange={(event) => setGatePriceUsdc(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail-gate">Thumbnail</Label>
          <Input
            id="thumbnail-gate"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expiry-gate">Access expiry</Label>
          <select
            id="expiry-gate"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={accessExpiryType}
            onChange={(event) => setAccessExpiryType(event.target.value)}
          >
            <option>Forever</option>
            <option>One-time only</option>
            <option>24 hours</option>
            <option>7 days</option>
            <option>30 days</option>
          </select>
        </div>
      </div>
    </>
  )
}
