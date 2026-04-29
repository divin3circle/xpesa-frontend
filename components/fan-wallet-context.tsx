"use client"

import React, { createContext, useState, useCallback } from "react"

export interface FanWalletContextType {
  fanSmartAccountAddress: string | null
  fanWalletEOA: string | null
  isConnectingFan: boolean
  connectFanWallet: (smartAccountAddress: string, eoa: string) => void
  disconnectFanWallet: () => void
}

export const FanWalletContext = createContext<FanWalletContextType>({
  fanSmartAccountAddress: null,
  fanWalletEOA: null,
  isConnectingFan: false,
  connectFanWallet: () => {},
  disconnectFanWallet: () => {},
})

export function FanWalletProvider({ children }: { children: React.ReactNode }) {
  const [fanSmartAccountAddress, setFanSmartAccountAddress] = useState<
    string | null
  >(null)
  const [fanWalletEOA, setFanWalletEOA] = useState<string | null>(null)
  const [isConnectingFan, setIsConnectingFan] = useState(false)

  const connectFanWallet = useCallback(
    (smartAccountAddress: string, eoa: string) => {
      setFanSmartAccountAddress(smartAccountAddress)
      setFanWalletEOA(eoa)
      setIsConnectingFan(false)
    },
    []
  )

  const disconnectFanWallet = useCallback(() => {
    setFanSmartAccountAddress(null)
    setFanWalletEOA(null)
    setIsConnectingFan(false)
  }, [])

  return (
    <FanWalletContext.Provider
      value={{
        fanSmartAccountAddress,
        fanWalletEOA,
        isConnectingFan,
        connectFanWallet,
        disconnectFanWallet,
      }}
    >
      {children}
    </FanWalletContext.Provider>
  )
}

export function useFanWalletContext() {
  const context = React.useContext(FanWalletContext)
  if (!context) {
    throw new Error("useFanWalletContext must be used within FanWalletProvider")
  }
  return context
}
