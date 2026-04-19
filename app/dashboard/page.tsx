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
import { useUserDetails } from "@/hooks/use-user"
import LoadingSpinner from "@/components/ui/loading-spinner"
import {
  getCurrentMonthName,
  getGreetingBasedOnCurrentTime,
  getReadableDateTime,
} from "@/lib/utils"
import { useGetAllTimeEarnings } from "@/hooks/use-stats"
import { redirect } from "next/navigation"
import { useMyLinks } from "@/hooks/use-links"

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
  const { data: links, isLoading: isLinksLoading } = useMyLinks()
  const {
    data: allTimeEarningsData,
    isLoading: isAllTimeEarningsLoading,
    error: allTimeEarningsError,
  } = useGetAllTimeEarnings()

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="mb- font-sans font-semibold text-muted-foreground">
          Just a moment..
        </h1>
        <LoadingSpinner size={5} />
      </div>
    )
  }

  if (error) {
    redirect(`/error?q=${error.message}`)
  }
  if (allTimeEarningsError) {
    redirect(
      `/error?q=${allTimeEarningsError?.message || "Failed to load earnings data"}`
    )
  }
  if (!allTimeEarningsData || !data) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="mb- font-sans font-semibold text-muted-foreground">
          Just a moment..
        </h1>
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
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>All Time Earnings</CardDescription>
            {isAllTimeEarningsLoading ? (
              <div className="my-2 flex items-center justify-start font-heading text-3xl font-semibold text-muted-foreground">
                $<LoadingSpinner size={5} />
                <LoadingSpinner size={5} />.
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
              </div>
            ) : (
              <CardTitle className="font-heading text-3xl">
                ${allTimeEarningsData?.allTimeEarnings}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Since{" "}
            {getReadableDateTime("month-and-year", data.creator?.created_at)}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            {isAllTimeEarningsLoading ? (
              <div className="my-2 flex items-center justify-start font-heading text-3xl font-semibold text-muted-foreground">
                $<LoadingSpinner size={5} />
                <LoadingSpinner size={5} />.
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
              </div>
            ) : (
              <CardTitle className="font-heading text-3xl">
                ${allTimeEarningsData?.thisMonthEarnings}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Amount earned in {getCurrentMonthName()}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Transactions Count</CardDescription>
            {isAllTimeEarningsLoading ? (
              <div className="my-2 flex items-center justify-start font-heading text-3xl font-semibold text-muted-foreground">
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
              </div>
            ) : (
              <CardTitle className="font-heading text-3xl">
                {allTimeEarningsData?.allTimeTransactions}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Since{" "}
            {getReadableDateTime("month-and-year", data.creator?.created_at)}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Active Links</CardDescription>
            {isLinksLoading ? (
              <div className="my-2 flex items-center justify-start font-heading text-3xl font-semibold text-muted-foreground">
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
              </div>
            ) : (
              <CardTitle className="font-heading text-3xl">
                {links?.links.length || 0}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Since{" "}
            {getReadableDateTime("month-and-year", data.creator?.created_at)}
          </CardContent>
        </Card>
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
                        {data?.creator?.wallet_address
                          ? `${data.creator.wallet_address.slice(
                              0,
                              6
                            )}...${data.creator.wallet_address.slice(-4)}`
                          : "Not connected"}
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
