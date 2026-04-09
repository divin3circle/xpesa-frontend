"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OnboardingStepHeader } from "@/components/onboarding/step-header"
import { useOnboardingStepGuard } from "@/components/onboarding/onboarding-step-guard"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { IconInfoCircleFilled } from "@tabler/icons-react"
import { ConnectButton, useActiveWallet } from "thirdweb/react"
import { sepolia } from "thirdweb/chains"
import { client } from "@/lib/utils"
import { useTheme } from "next-themes"

export function WalletStep() {
  useOnboardingStepGuard("wallet")
  const wallet = useActiveWallet()
  const theme = useTheme()

  const router = useRouter()
  const { markStepComplete, setWallet, state } = useOnboarding()
  const [connectedAddress, setConnectedAddress] = useState<string | null>(
    state.walletMethod === "existing" ? state.walletAddress : null
  )

  const selectedWallet = useMemo(() => {
    if (state.walletAddress) {
      return state.walletAddress
    }

    return connectedAddress
  }, [connectedAddress, state.walletAddress])

  function handleContinue() {
    if (!selectedWallet || !state.walletMethod) return

    markStepComplete("wallet")
    router.push("/onboarding/handle")
  }

  return (
    <section>
      <OnboardingStepHeader step="wallet" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-3xl border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              Connect existing wallet
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              A wallet allows you to send and receive payments.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Click the button below to connect your wallet. If you do not have
              a wallet, you can create one too.
            </div>
            <ConnectButton
              theme={theme.resolvedTheme === "dark" ? "dark" : "light"}
              connectModal={{
                title: "Connect your wallet",
                titleIcon: "/logo.png",
                size: "compact",
              }}
              accountAbstraction={{
                chain: sepolia,
                sponsorGas: true,
              }}
              onConnect={() => {
                setConnectedAddress(wallet?.getAccount()?.address || "")
              }}
              client={client}
              connectButton={{
                label: "Connect Wallet",
                className: "w-full",
                style: {
                  width: "100%",
                  height: "40px",
                  fontSize: "14px",
                  backgroundColor: "oklch(0.696 0.17 162.48)",
                  borderRadius: "100px",
                  fontWeight: "700",
                },
              }}
            />

            {wallet?.getAccount()?.address ? (
              <div className="mt-2 rounded-2xl border border-border/70 bg-muted/40 p-3 text-sm">
                <p className="mb-2 text-muted-foreground">Connected address</p>
                <p className="truncate font-sans text-xs">
                  {wallet?.getAccount()?.address.slice(0, 4)}...
                  {wallet?.getAccount()?.address.slice(-4)}
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    setWallet(wallet?.getAccount()?.address || "", "existing")
                  }
                  disabled={
                    !wallet?.getAccount()?.address ||
                    state.walletAddress === wallet?.getAccount()?.address
                  }
                >
                  {state.walletAddress === wallet?.getAccount()?.address
                    ? "Selected ✅"
                    : "Use this wallet"}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {selectedWallet ? (
            <Check className="size-4 text-primary" />
          ) : (
            <IconInfoCircleFilled className="size-4" />
          )}
          {selectedWallet
            ? "Wallet selected"
            : "Select a wallet to continue. We never hold your funds. Payments go directly to your wallet."}
        </div>
        <Button
          type="button"
          size="lg"
          disabled={!state.walletAddress}
          onClick={handleContinue}
          className="mt-2 w-full md:mt-0 md:w-auto"
        >
          Continue
        </Button>
      </div>
    </section>
  )
}
