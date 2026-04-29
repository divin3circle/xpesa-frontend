"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useFanWalletConnection } from "@/hooks/use-fan-wallet-connection"
import { useFanWalletContext } from "@/components/fan-wallet-context"
import { HugeiconsIcon } from "@hugeicons/react"
import { Wallet01FreeIcons } from "@hugeicons/core-free-icons"

interface FanWalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FanWalletConnectModal({
  isOpen,
  onClose,
}: FanWalletConnectModalProps) {
  const { connectAsSmartAccount, disconnectFanWallet } =
    useFanWalletConnection()
  const { fanSmartAccountAddress, isConnectingFan } = useFanWalletContext()

  const handleConnect = async () => {
    const result = await connectAsSmartAccount()
    if (result) {
      onClose()
    }
  }

  const handleDisconnect = () => {
    disconnectFanWallet()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Wallet01FreeIcons} />
            Connect Fan Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your wallet as a smart account to access protected content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fanSmartAccountAddress ? (
            <>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm font-medium text-green-900">
                  ✓ Connected
                </p>
                <p className="mt-1 text-xs text-green-700">
                  Smart Account: {fanSmartAccountAddress.slice(0, 6)}...
                  {fanSmartAccountAddress.slice(-4)}
                </p>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-lg p-4 text-sm">
                <p className="font-medium">What is a smart account?</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Contract-based wallet for gasless transactions</li>
                  <li>• Controlled by your MetaMask EOA</li>
                  <li>• Enhanced security and features</li>
                </ul>
              </div>

              <Button
                onClick={handleConnect}
                disabled={isConnectingFan}
                className="w-full"
              >
                {isConnectingFan && <LoadingSpinner />}
                {!isConnectingFan && "Connect as Smart Account"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
