"use client"

import { useMutation } from "@tanstack/react-query"
import { useActiveAccount, useActiveWallet, useConnect } from "thirdweb/react"
import { signMessage } from "thirdweb/utils"
import { createWallet } from "thirdweb/wallets"

import { client } from "@/lib/utils"
import { useFanWalletContext } from "@/components/fan-wallet-context"

type WalletSessionSignatureParams = {
  tokenId: string
  expectedWalletAddress?: string
}

export function useWalletSessionSignature() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { connect } = useConnect()
  const { fanSmartAccountAddress, fanWalletEOA } = useFanWalletContext()

  return useMutation({
    mutationFn: async ({
      tokenId,
      expectedWalletAddress,
    }: WalletSessionSignatureParams) => {
      if (!tokenId) {
        throw new Error("Token id is required")
      }

      // If fan wallet smart account is connected, use the smart wallet's admin account to sign
      if (fanSmartAccountAddress && fanWalletEOA) {
        let signingAccount =
          wallet?.getAdminAccount?.() ?? account ?? wallet?.getAccount()

        if (!signingAccount) {
          const connectedWallet = await connect(async () => {
            const metamask = createWallet("io.metamask")
            await metamask.connect({ client })
            return metamask
          })

          signingAccount =
            connectedWallet?.getAdminAccount?.() ??
            connectedWallet?.getAccount?.()
        }

        if (!signingAccount) {
          throw new Error("No wallet account available for signing")
        }

        const signature = await signMessage({
          account: signingAccount,
          message: `xpesa-open:${tokenId}`,
        })

        return {
          walletAddress: fanSmartAccountAddress,
          signingWalletAddress: signingAccount.address,
          signature,
        }
      }

      // Otherwise use creator wallet (EOA)
      let activeAccount = account ?? wallet?.getAccount()

      if (!activeAccount) {
        const connectedWallet = await connect(async () => {
          const metamask = createWallet("io.metamask")
          await metamask.connect({ client })
          return metamask
        })

        activeAccount = connectedWallet?.getAccount()
      }

      if (!activeAccount) {
        throw new Error("No wallet account available")
      }

      const connectedAddress = activeAccount.address

      if (
        expectedWalletAddress &&
        connectedAddress.toLowerCase() !== expectedWalletAddress.toLowerCase()
      ) {
        throw new Error("Connected wallet does not match the entered address")
      }

      const signature = await signMessage({
        account: activeAccount,
        message: `xpesa-open:${tokenId}`,
      })

      return {
        walletAddress: connectedAddress,
        signingWalletAddress: connectedAddress,
        signature,
      }
    },
  })
}
