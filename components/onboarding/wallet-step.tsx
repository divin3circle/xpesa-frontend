"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, Mail, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { OnboardingStepHeader } from "@/components/onboarding/step-header"
import { useOnboardingStepGuard } from "@/components/onboarding/onboarding-step-guard"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { IconInfoCircleFilled } from "@tabler/icons-react"

function createMockWalletAddress() {
  return `0x${Math.random().toString(16).slice(2, 42).padEnd(40, "0")}`
}

export function WalletStep() {
  useOnboardingStepGuard("wallet")

  const router = useRouter()
  const { markStepComplete, setWallet, state } = useOnboarding()
  const [connectedAddress, setConnectedAddress] = useState<string | null>(
    state.walletMethod === "existing" ? state.walletAddress : null
  )
  const [generatedAddress, setGeneratedAddress] = useState<string | null>(
    state.walletMethod === "embedded" ? state.walletAddress : null
  )
  const [email, setEmail] = useState("")

  const selectedWallet = useMemo(() => {
    if (state.walletAddress) {
      return state.walletAddress
    }

    return connectedAddress ?? generatedAddress
  }, [connectedAddress, generatedAddress, state.walletAddress])

  function handleConnectExistingWallet() {
    setConnectedAddress(createMockWalletAddress())
  }

  function handleCreateEmbeddedWallet() {
    if (!email.includes("@")) return
    setGeneratedAddress(createMockWalletAddress())
  }

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
              Use the ConnectButton to connect your current wallet.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              className="w-full"
              onClick={handleConnectExistingWallet}
            >
              Connect wallet
            </Button>

            {connectedAddress ? (
              <div className="rounded-2xl border border-border/70 bg-muted/40 p-3 text-sm">
                <p className="mb-2 text-muted-foreground">Connected address</p>
                <p className="truncate font-mono text-xs">{connectedAddress}</p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  onClick={() => setWallet(connectedAddress, "existing")}
                >
                  Use this wallet
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              Create a wallet
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create a wallet with your email.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              type="button"
              className="w-full"
              onClick={handleCreateEmbeddedWallet}
            >
              Create wallet with email
            </Button>

            {generatedAddress ? (
              <div className="rounded-2xl border border-border/70 bg-muted/40 p-3 text-sm">
                <p className="mb-2 text-muted-foreground">
                  Generated wallet address
                </p>
                <p className="truncate font-mono text-xs">{generatedAddress}</p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  onClick={() => setWallet(generatedAddress, "embedded")}
                >
                  Use this wallet
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {selectedWallet ? (
            <Check className="size-4 text-primary" />
          ) : (
            <IconInfoCircleFilled className="size-4" />
          )}
          {selectedWallet
            ? "Wallet selected"
            : "Select a wallet to continue. We never holds your funds. Payments go directly to your wallet."}
        </div>
        <Button
          type="button"
          size="lg"
          disabled={!state.walletAddress}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </section>
  )
}
