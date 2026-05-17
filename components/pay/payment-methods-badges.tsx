import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { envConfig } from "@/lib/env"

type PaymentMethodsBadgesProps = {
  showConnectedBadge: boolean
  hasChainMismatch: boolean
  connectedChainLabel: string
  onOpenChainSwitchDialog: () => void
}

export function PaymentMethodsBadges({
  showConnectedBadge,
  hasChainMismatch,
  connectedChainLabel,
  onOpenChainSwitchDialog,
}: PaymentMethodsBadgesProps) {
  const paymentChainIcon = envConfig.CHAIN === "A" ? "/avax.svg" : "/hbar.svg"

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-2 px-3 py-1">
          <Image
            src={paymentChainIcon}
            alt={envConfig.PAYMENT_NETWORK_LABEL}
            width={14}
            height={14}
            className="rounded-full"
          />
          <span>Payment Chain: {envConfig.PAYMENT_NETWORK_LABEL}</span>
        </Badge>
        {showConnectedBadge ? (
          <button
            type="button"
            onClick={onOpenChainSwitchDialog}
            className="rounded-full"
            title="Open network switch dialog"
          >
            <Badge
              variant={hasChainMismatch ? "destructive" : "secondary"}
              className="cursor-pointer px-3 py-1"
            >
              Connected: {connectedChainLabel}
            </Badge>
          </button>
        ) : null}
      </div>

      <h1 className="font-heading font-semibold text-muted-foreground">
        Supported Methods
      </h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1">
          <Image src="/usdc.svg" alt="USDC" width={16} height={16} />
          <span className="text-sm font-semibold text-muted-foreground">
            USDC
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1">
          <Image src="/usdt.svg" alt="USDT" width={16} height={16} />
          <span className="text-sm font-semibold text-muted-foreground">
            USDT
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1">
          <Image
            src="/mpesa.png"
            alt="Mobile"
            className="size-5 rounded"
            width={100}
            height={100}
          />
          <span className="text-sm font-semibold text-muted-foreground">
            Mobile
          </span>
        </div>
      </div>
    </>
  )
}
