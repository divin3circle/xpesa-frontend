import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { envConfig } from "@/lib/env"

export type PayMethodOption = "usdc" | "multichain" | "mobile"

type PaymentMethodsBadgesProps = {
  showConnectedBadge: boolean
  hasChainMismatch: boolean
  connectedChainLabel: string
  onOpenChainSwitchDialog: () => void
  selectedMethod: PayMethodOption
  onSelectMethod: (method: PayMethodOption) => void
}

export function PaymentMethodsBadges({
  showConnectedBadge,
  hasChainMismatch,
  connectedChainLabel,
  onOpenChainSwitchDialog,
  selectedMethod,
  onSelectMethod,
}: PaymentMethodsBadgesProps) {
  const paymentChainIcon = envConfig.CHAIN === "A" ? "/avax.svg" : "/hbar.svg"
  const methods: Array<{
    value: PayMethodOption
    label: string
    icon: string
    alt: string
  }> = [
    {
      value: "usdc",
      label: "USDC",
      icon: "/usdcavax.png",
      alt: "USDC",
    },
    {
      value: "multichain",
      label: "Other",
      icon: "/usdc.svg",
      alt: "Multichain USDC",
    },
    {
      value: "mobile",
      label: "Mobile",
      icon: "/mpesa.png",
      alt: "Mobile money",
    },
  ]

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

      <div className="space-y-2">
        <h2 className="font-heading text-sm font-semibold text-muted-foreground">
          Payment method
        </h2>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {methods.map((method) => {
            const isSelected = selectedMethod === method.value
            const disabled =
              method.value === "mobile" && !envConfig.KOTANI_ENABLED
            return (
              <button
                key={method.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                title={disabled ? "Coming soon" : undefined}
                onClick={() => {
                  if (!disabled) onSelectMethod(method.value)
                }}
                className={`flex items-center justify-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
                  disabled
                    ? "cursor-not-allowed border-border/50 text-muted-foreground/50"
                    : isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Image
                  src={method.icon}
                  alt={method.alt}
                  className={method.value === "mobile" ? "size-5 rounded" : ""}
                  width={24}
                  height={24}
                />
                <span>{method.label}</span>
                {disabled ? (
                  <span className="text-[10px] opacity-70">soon</span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
