import { useCallback, useEffect, useMemo, useState } from "react"
import { useActiveAccount, useActiveWallet } from "thirdweb/react"
import { toast } from "sonner"

import { PAYMENT_CHAIN } from "@/lib/thirdweb/chains"
import { envConfig } from "@/lib/env"
import { getErrorMessage } from "@/lib/utils"

export function usePaymentChainGuard() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const [isSwitchingChain, setIsSwitchingChain] = useState(false)
  const [showChainSwitchDialog, setShowChainSwitchDialog] = useState(false)

  const expectedChainId = Number(PAYMENT_CHAIN.id)
  const connectedChainId = wallet?.getChain()?.id

  const hasChainMismatch =
    Boolean(account) &&
    Boolean(wallet) &&
    connectedChainId !== undefined &&
    Number(connectedChainId) !== expectedChainId

  const connectedChainLabel = useMemo(() => {
    if (connectedChainId === undefined) return "Not connected"

    switch (Number(connectedChainId)) {
      case 43113:
        return "Avalanche Fuji"
      case 43114:
        return "Avalanche Mainnet"
      case 296:
        return "Hedera Testnet"
      case 295:
        return "Hedera Mainnet"
      default:
        return `Chain ${connectedChainId}`
    }
  }, [connectedChainId])

  useEffect(() => {
    setShowChainSwitchDialog(hasChainMismatch)
  }, [hasChainMismatch])

  const openChainSwitchDialog = useCallback(() => {
    setShowChainSwitchDialog(true)
  }, [])

  const handleSwitchNetwork = useCallback(async () => {
    if (!wallet) return

    setIsSwitchingChain(true)
    try {
      await wallet.switchChain(PAYMENT_CHAIN)
      toast.success(`Switched to ${envConfig.PAYMENT_NETWORK_LABEL}`)
      setShowChainSwitchDialog(false)
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to switch network")
    } finally {
      setIsSwitchingChain(false)
    }
  }, [wallet])

  return {
    account,
    connectedChainLabel,
    hasChainMismatch,
    isSwitchingChain,
    showChainSwitchDialog,
    setShowChainSwitchDialog,
    openChainSwitchDialog,
    handleSwitchNetwork,
  }
}
