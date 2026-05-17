import Image from "next/image"
import React from "react"
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ICategoryApp{
  id: string
  name: string
  description: string
  link: string
  icon: string
}

interface IEarnCategory {
  id: string
  title: string
  description: string
  apps: ICategoryApp[]
}

const availableEarningMethods = [
  {
    id: "lending",
    title: "Lending",
    description:
      "Deposit your USDC into a liquidity pool where other users can borrow it, allowing you to earn a variable interest rate paid by those borrowers.",
    apps: [
      {
        id: "aave",
        name: "Aave V4",
        description:
          "The premier decentralized lending protocol. You can supply USDC directly to the Avalanche market and earn a floating variable yield.",
        link: "https://app.aave.com/markets/?marketName=proto_avalanche_v3",
        icon: "/aave.svg",
      },
      {
        id: "benqi",
        name: "Benqi",
        description:
          "One of the largest Avalanche-native liquidity protocols. It provides a dedicated market for supplying and borrowing stablecoins.",
        link: "https://app.benqi.fi/lending",
        icon: "/benqi.svg",
      },
    ],
  },
  {
    id: "yield-aggregators",
    title: "Yield Aggregators",
    description:
      "Smart-contract vaults automatically move your USDC between different pools and re-invest your rewards to continuously compound your returns without manual effort.",
    apps: [
      {
        id: "yield-yak",
        name: "Yield Yak",
        description:
          "This protocol auto-compounds your earned interest across different liquidity pools on Avalanche.",
        link: "https://www.yieldyak.com/avalanche/",
        icon: "/yieldyak.avif",
      }
    ],
  },
]

function SupportedAssets() {
  return (
    <div className="-gap-2 flex items-center">
      <Image
        src="/usdc.svg"
        alt="usdc-icon"
        width={256}
        height={256}
        className="size-6 md:size-8"
      />
      <Image
        src="/usdt.svg"
        alt="usdc-icon"
        width={256}
        height={256}
        className="-ml-3 size-6 md:size-8"
      />
      <Image
        src="/avax.svg"
        alt="usdc-icon"
        width={256}
        height={256}
        className="-ml-3 size-6 md:size-8"
      />
      <div className="z-10 -ml-3 flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background md:size-8 md:text-sm">
        +44
      </div>
    </div>
  )
}

export function EarnActionFooter() {
  return (
    <DrawerFooter className="mx-auto my-0 w-full md:max-w-md">
      <DrawerClose>
        <Button variant="outline" className="w-full">
          Cancel
        </Button>
      </DrawerClose>
    </DrawerFooter>
  )
}

function CategoryApp({ app } : {
  app: ICategoryApp
}) {
  return (
    <Link href={app.link} className="p-2 hover:bg-foreground/5 duration-200 ease-in flex flex-col gap-2 border border-border/75 rounded-2xl">
      <div className="">
        <Image
          src={app.icon}
          alt={app.name}
          height={1000}
          width={1000}
          className="size-14 object-contain rounded-xl"
        />
        <h1 className="text-md font-semibold mt-2">{app.name}</h1>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {app.description}
        </p>
        <div className="flex w-full items-center justify-between">
          <p className="text-xs leading-relaxed">
            Supports
          </p>
          <SupportedAssets />
        </div>
      </div>
    </Link>
  )
}

function EarnCategory({ category } : {
  category: IEarnCategory
}) {
  return (
    <div>
      <h1 className="text-heading text-lg font-semibold">{category.title}</h1>
      <div className="flex flex-col gap-2">
        {category.apps.map((app) => (
          <CategoryApp app={app} key={app.id} />
        ))}
      </div>
    </div>
  )
}

export default function EarnAction() {
  return (
    <div className="my-4 flex flex-col items-center gap-4">
      {availableEarningMethods.map((method) => (
        <EarnCategory key={method.id} category={method} />
      ))}
    </div>
  )
}