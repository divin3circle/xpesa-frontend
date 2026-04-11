"use client"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  TransactionManagementTable,
  type TransactionRecord,
} from "@/components/ui/transaction-management-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  LinkSquare01Icon,
  SmartPhone02Icon,
} from "@hugeicons/core-free-icons"
import Image from "next/image"
import { AvatarDisplay } from "@/components/ui/avatar-group-display"
import {
  SupportedNetwork,
  supportedNetworks,
  SupportedToken,
  supportedTokens,
} from "@/lib/dashboard"
import { useUserDetails } from "@/hooks/use-user";
import LoadingSpinner from "@/components/ui/loading-spinner"
import { getGreetingBasedOnCurrentTime } from "@/lib/utils";

const stats = [
  { label: "Total earned", value: "$6,842.11", hint: "All time" },
  { label: "This month", value: "$1,204.75", hint: "+14.3% vs last month" },
  { label: "Transactions", value: "427", hint: "Confirmed payments" },
  { label: "Active links", value: "18", hint: "4 tip links, 14 gate links" },
]

const recentTransactions: TransactionRecord[] = [
  {
    link: "React Native Crash Course",
    wallet: "0x4D2B...A91e",
    amount: "$12.00",
    date: "Today, 11:42",
    hash: "0x9f...e2b",
    network: "Base",
    token: "USDC",
    blockNumber: 24561219,
    gasFee: "$0.03",
    confirmations: 48,
    status: "confirmed",
    fromAddress: "0x5A7B...F329",
    toAddress: "0x4D2B...A91e",
    explorerUrl: "https://basescan.org",
  },
  {
    link: "Product Design Teardown",
    wallet: "0x91Aa...f2B0",
    amount: "$5.00",
    date: "Today, 09:18",
    hash: "0x7a...119",
    network: "Polygon",
    token: "USDT",
    blockNumber: 61488221,
    gasFee: "$0.02",
    confirmations: 32,
    status: "confirmed",
    fromAddress: "0x2f11...9c66",
    toAddress: "0x91Aa...f2B0",
    explorerUrl: "https://polygonscan.com",
  },
  {
    link: "Buy me chai",
    wallet: "0x8Fe1...c44b",
    amount: "$3.50",
    date: "Yesterday",
    hash: "0x8d...413",
    network: "Solana",
    token: "USDC",
    blockNumber: 27644155,
    gasFee: "$0.01",
    confirmations: 210,
    status: "confirmed",
    fromAddress: "0xB36D...b188",
    toAddress: "0x8Fe1...c44b",
    explorerUrl: "https://solscan.io",
  },
]

export default function Page() {
  const { data, isLoading, error } = useUserDetails()

  if (isLoading || error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <h1 className="font-sans mb- text-muted-foreground font-semibold">Just a moment..</h1>
        <LoadingSpinner size={5} />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Good {getGreetingBasedOnCurrentTime()}, {data?.creator?.display_name}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Here is a live snapshot of your earnings, links, and payout readiness.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              {stat.hint}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <TransactionManagementTable
          className="lg:col-span-3"
          transactions={recentTransactions}
          historyHref="/dashboard/wallet/history"
        />

        <Card className="rounded-2xl border-none bg-transparent shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <>
              <div className="rounded-2xl border">
                <Image
                  src="/icon.png"
                  alt="Wallet"
                  width={200}
                  height={100}
                  className="w-full rounded-t-2xl"
                />
                <div className="">
                  <div className="flex items-center justify-between px-3 pt-3 pb-5">
                    <p className="text-sm font-medium">Wallet Address</p>
                    <div className="flex items-center gap-1">
                      <p className="font-heading text-sm text-muted-foreground">
                        0x4D2B...A91e
                      </p>
                      <HugeiconsIcon
                        icon={Copy01Icon}
                        className="size-4 cursor-pointer text-muted-foreground transition-colors duration-200 ease-in hover:text-chart-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-3 pb-3">
                    <p className="text-sm font-medium">Supported Tokens</p>
                    <AvatarDisplay
                      items={supportedTokens}
                      showGroupRemaining={false}
                      getAvatarSrc={(token: SupportedToken) => token.icon}
                      getAvatarAlt={(token: SupportedToken) =>
                        token.name.charAt(0)
                      }
                      getAvatarFallback={(token: SupportedToken) =>
                        token.symbol
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between px-3 pb-3">
                    <p className="text-sm font-medium">Networks</p>
                    <AvatarDisplay
                      items={supportedNetworks}
                      showGroupRemaining
                      getAvatarSrc={(token: SupportedNetwork) => token.icon}
                      getAvatarAlt={(token: SupportedNetwork) =>
                        token.name.charAt(0)
                      }
                      getAvatarFallback={(token: SupportedNetwork) =>
                        token.symbol.charAt(0)
                      }
                    />
                  </div>
                </div>
              </div>
              <Button className="flex h-10 w-full max-w-sm items-center justify-between px-4">
                <Link href="/dashboard/links/create">Create new link</Link>
                <HugeiconsIcon icon={LinkSquare01Icon} />
              </Button>
              <Button
                variant="secondary"
                className="flex h-10 w-full max-w-sm items-center justify-between px-4"
              >
                <Link href="/dashboard/wallet/withdraw">
                  Withdraw to Mobile Money
                </Link>
                <HugeiconsIcon icon={SmartPhone02Icon} />
              </Button>
            </>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
