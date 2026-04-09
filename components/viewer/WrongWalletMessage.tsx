import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function truncateWallet(wallet: string) {
  if (!wallet) return ""
  if (wallet.length < 12) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export function WrongWalletMessage({
  requiredWallet,
}: {
  requiredWallet?: string
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            This content was purchased by a different wallet.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Connect {truncateWallet(requiredWallet ?? "0x0000000000000000")} to
            continue.
          </p>
          <p>
            Wallet connect integration can now plug into this component without
            changing viewer page structure.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
