"use client"

import { Button } from "@/components/ui/button"

export function ReceiptMintButton({
  disabled,
  isMinting,
  onMint,
}: {
  disabled: boolean
  isMinting: boolean
  onMint: () => void
}) {
  return (
    <Button onClick={onMint} disabled={disabled || isMinting} className="w-full">
      {isMinting ? "Minting receipt..." : "Mint supporter receipt NFT"}
    </Button>
  )
}
