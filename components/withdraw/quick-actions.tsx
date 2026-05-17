"use client"

import QuickAction, { IQuickAction } from "./quick-action"
import WithdrawReceiveAction, {
  WithdrawReceiveActionFooter,
} from "@/components/withdraw/receive-action"
import { Button } from "@/components/ui/button"
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import React from "react"
import ExportAction, { ExportActionFooter } from "@/components/withdraw/export-action"
import EarnAction, { EarnActionFooter } from "@/components/withdraw/earn-action"

const quickActions: IQuickAction[] = [
  {
    id: "earn",
    title: "Earn",
    description:
      "Use your idle Avax or multichain USDC to earn yields daily on the blockchain.",
    onClick: () => {},
    content: <EarnAction />,
    footer: <EarnActionFooter />,
  },
  {
    id: "withdraw",
    title: "Withdraw",
    description:
      "Get your USDC where you want, when your want via our off-ramp services.",
    onClick: () => {},
    content: <h1>Withdraw</h1>,
    footer: (
      <DrawerFooter className="mx-auto my-0 w-full md:max-w-md">
        <Button>Submit</Button>
        <DrawerClose>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    ),
  },
  {
    id: "wallet",
    title: "Receive",
    description:
      "Share your smart account address to receive USDC or other assets on Avalanche.",
    onClick: () => {},
    content: <WithdrawReceiveAction />,
    footer: <WithdrawReceiveActionFooter />,
  },
  {
    id: "export",
    title: "Export",
    description:
      "Export your withdrawals and investment activities to a format of your choice.",
    onClick: () => {},
    content: <ExportAction />,
    footer: <ExportActionFooter />,
  },
]

export default function QuickActions() {
  return (
    <div className="my-8 w-full min-w-0">
      <h1 className="text-heading text-2xl font-semibold">Quick Actions</h1>
      <div className="-mx-4 mt-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex w-max items-center gap-2">
          {quickActions.map((item) => (
            <QuickAction key={item.id} quickAction={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
