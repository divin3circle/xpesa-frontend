"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useActiveAccount } from "thirdweb/react"
import { useMyBalance } from "@/hooks/use-balance"
import ConnectButton from "@/components/ui/connect-button"
import LottieComponent from "@/components/lottie-animation"
import { Skeleton } from "@/components/ui/skeleton"

const withdrawals = [
  { date: "2026-04-05", usdc: "$420", kes: "KES 54,010", status: "Processing" },
  { date: "2026-04-03", usdc: "$280", kes: "KES 36,128", status: "Completed" },
]

export default function WithdrawFundsPage() {
  const activeAccount = useActiveAccount()
  const {
    data: balance,
    isLoading: balanceIsLoading,
  } = useMyBalance(activeAccount)

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Withdraw to Mobile Money
        </h1>
        <p className="text-sm text-muted-foreground">
          Convert USDC earnings to the currency of your choice
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="rounded-2xl bg-transparent shadow-none xl:col-span-3">
          <CardHeader>
            <CardTitle>Withdrawal request</CardTitle>
            <CardDescription>
              {activeAccount ? (
               <div className="flex gap-2">
                 <p className="text-sm text-muted-foreground">Available Balance: </p>
                 <div className="flex items-center justify-center gap-1 font-semibold underline">
                   { balanceIsLoading ? <Skeleton /> : `${balance} USDC`}
                   <Image src={"/usdc.svg"} alt={"USDC Icon"} height={1000} width={1000} className={"h-5 w-5 rounded-full object-contain"} />
                 </div>
               </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Connect wallet to withdraw.
                </p>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className={activeAccount ? "space-y-4" : "flex flex-col items-center justify-center"}>
            {activeAccount ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (USDC)</Label>
                  <Input id="withdraw-amount" placeholder="100.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdraw-phone">M-Pesa number</Label>
                  <Input id="withdraw-phone" placeholder="07XXXXXXXX" />
                </div>
                <div className="rounded-2xl border bg-muted/40 p-3 text-sm">
                  <p>You receive approximately: KES 12,884</p>
                  <p className="text-muted-foreground">
                    Includes estimated conversion + processing fee.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button>Withdraw to M-Pesa</Button>
                </div>
              </>
            ) : (
              <div className="w-full md:w-1/4">
                <LottieComponent page="wallet" />
                <ConnectButton variant="outline" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-chart-1 bg-transparent shadow-none xl:col-span-2">
          <CardHeader>
            <CardTitle>Confirmation preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex w-full flex-col items-center justify-center">
              <Image
                src="/withdraw.webp"
                alt="Wallet"
                width={200}
                height={100}
                className="w-44 rounded-2xl align-middle"
              />
            </div>
            <div className="flex w-full items-center justify-between border-b border-dashed pb-1">
              <p className="text-muted-foreground">USDC amount</p>
              <p className="font-heading font-semibold">$100.00</p>
            </div>
            <div className="flex w-full items-center justify-between border-b border-dashed pb-1">
              <p className="text-muted-foreground">M-Pesa Number</p>
              <p className="font-heading font-semibold">07XXXXXXXX</p>
            </div>
            <div className="flex w-full items-center justify-between border-b border-dashed pb-1">
              <p className="text-muted-foreground">Estimated KES</p>
              <p className="font-heading font-semibold">KES 12,884</p>
            </div>
            <p className="text-xs text-muted-foreground">
              ~ 5 minute processing time.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="rounded-2xl bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Recent withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid cursor-pointer grid-cols-2 gap-2 rounded-xl p-3 hover:bg-foreground/5 md:grid-cols-4">
              <p className="font-sans font-semibold">Date</p>
              <p className="font-sans font-semibold">Amount (USDC)</p>
              <p className="font-sans font-semibold">Amount (KES)</p>
              <p className="font-semibold text-muted-foreground">Status</p>
            </div>
            {withdrawals.map((item) => (
              <div
                key={`${item.date}-${item.usdc}`}
                className="grid cursor-pointer grid-cols-2 gap-2 rounded-xl p-3 hover:bg-foreground/5 md:grid-cols-4"
              >
                <p>{item.date}</p>
                <p>{item.usdc}</p>
                <p>{item.kes}</p>
                <p className="text-muted-foreground">{item.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
