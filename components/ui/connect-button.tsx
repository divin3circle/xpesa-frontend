"use client"

import { client } from "@/lib/utils"
import { useActiveWallet, useConnect, useDisconnect } from "thirdweb/react"
import { createWallet } from "thirdweb/wallets"
import { Button } from "./button"
import LoadingSpinner from "./loading-spinner"
import { toast } from "sonner"
function UIConnectButton() {
  const { connect, isConnecting, error } = useConnect()
  const wallet = useActiveWallet()
  const { disconnect } = useDisconnect()

  if (error) {
    return (
      <div className="text-xs text-red-500">
        Error connecting wallet: {error.message}
      </div>
    )
  }
  return (
    <Button
      type="button"
      className="w-full"
      onClick={() => {
        if (wallet) {
          toast.success("Wallet disconnected")
          disconnect(wallet)
        } else {
          connect(async () => {
            const metamask = createWallet("io.metamask")
            await metamask.connect({ client })
            return metamask
          })
        }
      }}
      disabled={wallet !== undefined}
    >
      {isConnecting && wallet === undefined && <LoadingSpinner />}
      {!isConnecting && wallet === undefined && "Connect Wallet"}
      {wallet && (
        <span className="ml-2 text-sm">
          ({wallet.getAccount()?.address?.slice(0, 4)}...
          {wallet.getAccount()?.address?.slice(-4)})
        </span>
      )}
    </Button>
  )
}

export default UIConnectButton
