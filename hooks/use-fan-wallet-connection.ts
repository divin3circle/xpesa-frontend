"use client"

import { useCallback } from "react"
import { client } from "@/lib/utils"
import { smartAccountConfig } from "@/lib/thirdweb/account-abstraction"
import { createWallet } from "thirdweb/wallets"
import { useFanWalletContext } from "@/components/fan-wallet-context"
import { toast } from "sonner"

/**
 * useFanWalletConnection
 * Handles smart-account connection for fan wallet using thirdweb account abstraction
 *
 * For MVP: We connect the user's EOA and derive a smart account address
 * In production: Would use full smart account factory setup with account abstraction
 */
export function useFanWalletConnection() {
  const { connectFanWallet, disconnectFanWallet } = useFanWalletContext()

  const connectAsSmartAccount = useCallback(async () => {
    try {
      // Step 1: Connect MetaMask EOA
      const metamask = createWallet("io.metamask")
      const eoaAccount = await metamask.connect({ client })

      if (!eoaAccount?.address) {
        toast.error("Failed to connect MetaMask wallet")
        return
      }

      const eoaAddress = eoaAccount.address

      // Step 2: Wrap the EOA in a smart account using the app's chain config
      const smartWallet = createWallet("smart", smartAccountConfig)
      const smartAccount = await smartWallet.connect({
        client,
        personalAccount: eoaAccount,
      })

      if (!smartAccount?.address) {
        toast.error("Failed to create smart account")
        return
      }

      const smartAccountAddress = smartAccount.address

      // Step 3: Store both in fan wallet context
      connectFanWallet(smartAccountAddress, eoaAddress)
      toast.success(
        `Fan wallet connected: ${smartAccountAddress.slice(0, 6)}...${smartAccountAddress.slice(-4)}`
      )

      return {
        smartAccountAddress,
        eoaAddress,
        account: smartAccount,
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to connect fan wallet"
      toast.error(message)
      console.error("Fan wallet connection error:", error)
    }
  }, [connectFanWallet])

  return {
    connectAsSmartAccount,
    disconnectFanWallet,
  }
}
