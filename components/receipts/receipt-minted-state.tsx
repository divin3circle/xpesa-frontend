"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resolveExplorerUrl } from "@/lib/utils"
import type { ReceiptMintRecord } from "./types"

export function ReceiptMintedState({ receipt }: { receipt: ReceiptMintRecord }) {
  return (
    <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
      <div>
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
          Supporter receipt minted
        </p>
        <p className="text-xs text-muted-foreground">
          Token #{receipt.token_id ?? "-"} is now in your wallet.
        </p>
      </div>
      {receipt.mint_tx_hash ? (
        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={resolveExplorerUrl(receipt.mint_tx_hash)} target="_blank">
            View mint transaction <ExternalLink className="ml-2 size-3" />
          </a>
        </Button>
      ) : null}
    </div>
  )
}
