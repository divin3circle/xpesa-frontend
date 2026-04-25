import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function DocumentWalletSignStep({
  walletAddress,
  setWalletAddress,
  signingState,
  onSign,
}: {
  walletAddress: string
  setWalletAddress: (value: string) => void
  signingState: "idle" | "signing" | "signed"
  onSign: () => void
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div className="space-y-4 rounded-3xl border bg-[linear-gradient(180deg,hsl(var(--muted)/0.25),hsl(var(--background)))] p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium">Connect wallet</p>
          <p className="text-sm text-muted-foreground">
            Enter the wallet used to purchase or unlock this token.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="wallet">Wallet address</Label>
          <Input
            id="wallet"
            placeholder="0x..."
            value={walletAddress}
            onChange={(event) => setWalletAddress(event.target.value)}
          />
        </div>
        <Button
          onClick={onSign}
          disabled={!walletAddress || signingState === "signing"}
        >
          {signingState === "signing"
            ? "Requesting signature..."
            : "Sign session with wallet"}
        </Button>
      </div>

      <div className="rounded-3xl border bg-background p-4">
        <p className="text-sm font-medium">What happens next</p>
        <Separator className="my-4" />
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>• Session signature is created locally.</li>
          <li>• Access is verified before loading the file.</li>
          <li>• Watermark is derived from the connected wallet.</li>
        </ul>
      </div>
    </div>
  )
}
