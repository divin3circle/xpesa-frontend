"use client"

import { ConnectButton } from "thirdweb/react"

import { client } from "@/lib/utils"
import { PAYMENT_CHAIN } from "@/lib/thirdweb/chains"
import { smartAccountConfig } from "@/lib/thirdweb/account-abstraction"

function connectButtonStyle(theme?: string) {
  return {
    backgroundColor: theme === "dark" ? "#fff" : "#000",
    color: theme === "dark" ? "#000" : "#fff",
    width: "100%",
    marginBottom: "1rem",
    borderRadius: "20px",
  }
}

export function ConnectToPayButton({ theme }: { theme?: string }) {
  return (
    <ConnectButton
      client={client}
      theme={theme === "dark" ? "dark" : "light"}
      chain={PAYMENT_CHAIN}
      accountAbstraction={smartAccountConfig}
      connectButton={{
        label: "Connect to Pay",
        style: connectButtonStyle(theme),
      }}
      connectModal={{ title: "Connect to pay", titleIcon: "/logo.png" }}
    />
  )
}
