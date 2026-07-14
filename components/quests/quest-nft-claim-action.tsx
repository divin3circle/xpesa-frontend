"use client"

import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { resolveExplorerUrl } from "@/lib/env"

export function QuestNftClaimAction({
  minted,
  mintTxHash,
  connected,
  disabled,
  onClaim,
  onConnect,
}: {
  minted: boolean
  mintTxHash?: string | null
  connected: boolean
  disabled: boolean
  onClaim: () => void
  onConnect: () => void
}) {
  if (minted && mintTxHash) {
    return (
      <Button asChild className="w-full sm:w-auto">
        <a href={resolveExplorerUrl(mintTxHash)} target="_blank" rel="noreferrer">
          View NFT transaction <ExternalLink className="size-4" />
        </a>
      </Button>
    )
  }

  if (!connected) {
    return (
      <Button className="w-full sm:w-auto" onClick={onConnect}>
        Connect wallet
      </Button>
    )
  }

  return (
    <Button className="w-full sm:w-auto" disabled={disabled} onClick={onClaim}>
      {disabled ? "Minting..." : "Claim NFT"}
    </Button>
  )
}
