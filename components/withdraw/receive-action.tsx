"use client"
import Image from "next/image"
import { getPaymentNetworkLabel } from "@/lib/env"
import { Button } from "@/components/ui/button"
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import React, { useState } from "react"
import { useActiveAccount } from "thirdweb/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadgeIcon, Copy01FreeIcons } from "@hugeicons/core-free-icons"
import ConnectButton from "@/components/ui/connect-button"
import { toast } from "sonner"

function SupportedReceivables() {
  return (
    <div className="-gap-2 flex items-center">
      <Image
        src="/usdc.svg"
        alt="usdc-icon"
        width={256}
        height={256}
        className="size-6 md:size-10"
      />
      <Image
        src="/usdt.svg"
        alt="usdc-icon"
        width={256}
        height={256}
        className="-ml-3 size-6 md:size-10"
      />
      <Image
        src="/avax.svg"
        alt="usdc-icon"
        width={256}
        height={256}
        className="-ml-3 size-6 md:size-10"
      />
      <div className="z-10 -ml-3 flex size-6 md:size-10 items-center justify-center rounded-full bg-foreground text-xs md:text-sm font-semibold text-background">
        +44
      </div>
    </div>
  )
}

export function WithdrawReceiveActionFooter(){
  const activeAccount = useActiveAccount();
  const [addressCopied, setAddressCopied] = useState<boolean>(false)
  return (
    <DrawerFooter className="mx-auto my-0 w-full md:max-w-md">
      {activeAccount && (
        <>
          <Button
            className="flex items-center gap-1"
            onClick={() => {
              navigator.clipboard.writeText(activeAccount?.address)
              toast.success("Wallet address copied!")
              setAddressCopied(true)
            }}
          >
            {activeAccount?.address.slice(0, 4)}...
            {activeAccount?.address.slice(-4)}
            <HugeiconsIcon
              icon={addressCopied ? CheckmarkBadgeIcon : Copy01FreeIcons}
            />
          </Button>
          <DrawerClose>
            <Button variant="outline" className="w-full">Close</Button>
          </DrawerClose>
        </>
      )}
    </DrawerFooter>
  )
}

export default function WithdrawReceiveAction() {
  const activeAccount = useActiveAccount()

  if (activeAccount) {
    return (
      <div className="my-4 flex flex-col items-center gap-2">
        <Image
          src="/qrcode.svg"
          alt="myqrcode"
          height={1000}
          width={1000}
          className="md:size-64 size-44 object-contain"
        />
        <div className="w-full">
          <div className="flex items-center justify-between border-b border-dashed border-border/75 py-4">
            <p className="text-sm font-semibold text-muted-foreground md:text-base">
              Supports
            </p>
            <SupportedReceivables />
          </div>
          <div className="flex items-center justify-between border-b border-dashed border-border/75 py-4">
            <p className="text-sm font-semibold text-muted-foreground md:text-base">
              Network
            </p>
            <div className="-gap-2 flex items-center">
              <Image
                src="/avax.svg"
                alt="avax-icon"
                width={256}
                height={256}
                className="size-6 md:size-10"
              />
              <p className="ml-2 text-sm font-semibold text-muted-foreground md:text-base">
                {getPaymentNetworkLabel()}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ConnectButton />
  )
}