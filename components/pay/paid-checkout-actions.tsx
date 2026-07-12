"use client"

import type { Account } from "thirdweb/wallets"

import type { PublicLinkDetails } from "@/app/api/public/links/route"
import { Button } from "@/components/ui/button"
import { envConfig } from "@/lib/env"
import { ConnectToPayButton } from "./connect-to-pay-button"
import { FiatPayButton } from "./fiat-pay-button"
import { PayButton } from "./pay-button"
import {
  PaymentMethodsBadges,
  type PayMethodOption,
} from "./payment-methods-badges"

type Props = {
  link: PublicLinkDetails
  account?: Account
  amount: number
  theme?: string
  selectedMethod: PayMethodOption
  onSelectMethod: (method: PayMethodOption) => void
  isPaying: boolean
  setIsPaying: (isPaying: boolean) => void
  hasChainMismatch: boolean
  connectedChainLabel: string
  onOpenChainSwitchDialog: () => void
  onSwitchNetwork: () => void
  isSwitchingChain: boolean
}

export function PaidCheckoutActions({
  link,
  account,
  amount,
  theme,
  selectedMethod,
  onSelectMethod,
  isPaying,
  setIsPaying,
  hasChainMismatch,
  connectedChainLabel,
  onOpenChainSwitchDialog,
  onSwitchNetwork,
  isSwitchingChain,
}: Props) {
  return (
    <>
      <PaymentMethodsBadges
        showConnectedBadge={Boolean(account)}
        hasChainMismatch={hasChainMismatch}
        connectedChainLabel={connectedChainLabel}
        onOpenChainSwitchDialog={onOpenChainSwitchDialog}
        selectedMethod={selectedMethod}
        onSelectMethod={onSelectMethod}
      />
      {selectedMethod === "mobile" ? (
        <FiatPayButton link={link} amount={amount} method="mobile_money" />
      ) : selectedMethod === "usdt" ? (
        <div className="space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            USDT checkout is not live yet.
          </p>
          <p>Use USDC or Mobile to complete purchase.</p>
        </div>
      ) : !account ? (
        <ConnectToPayButton theme={theme} />
      ) : hasChainMismatch ? (
        <div className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Your wallet is on the wrong network.
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Switch to {envConfig.PAYMENT_NETWORK_LABEL} to continue.
          </p>
          <Button
            type="button"
            onClick={onSwitchNetwork}
            disabled={isSwitchingChain}
            className="w-full"
          >
            {isSwitchingChain
              ? "Switching network..."
              : `Switch to ${envConfig.PAYMENT_NETWORK_LABEL}`}
          </Button>
        </div>
      ) : (
        <PayButton
          link={link}
          account={account}
          amount={amount}
          isPaying={isPaying}
          setIsPayingAction={setIsPaying}
        />
      )}
    </>
  )
}
