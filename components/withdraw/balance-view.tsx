"use client"
import QuickActions from "./quick-actions"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight02FreeIcons } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useActiveAccount } from "thirdweb/react"
import { useMyBalance } from "@/hooks/use-balance"
import LoadingSpinner from "../ui/loading-spinner"
import { getMultiChainExplorerUrl } from "@/lib/utils"

export default function WithdrawBalanceView() {
  const activeAccount = useActiveAccount()
  const { data: balance, isLoading, error } = useMyBalance(activeAccount)
  return (
    <div className="">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <div className="my-4 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground md:text-base">
            USDC Balance
          </p>
          {!error && (
            <div className="text-heading flex items-end text-4xl font-semibold md:text-6xl">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <h1>$</h1>
                  <h1>{balance?.split(".")[0]}</h1>.
                  <h1 className="text-xl text-muted-foreground md:text-3xl">
                    {balance?.split(".")[1] || "00"}
                  </h1>
                </>
              )}
            </div>
          )}
          {error && (
            <p className="text-sm text-muted-foreground md:text-base">
              {error?.message || "Failed to load USDC balance"}
            </p>
          )}
          <div className="flex gap-1 text-sm md:text-base">
            <div className="flex items-center gap-1">
              <Image
                src="/usdc.svg"
                alt="usdc-icon"
                width={256}
                height={256}
                className="size-4"
              />
              <p className="font-semibold text-blue-500 underline">USDC</p>
            </div>
            on
            <div className="flex items-center gap-1">
              <Image
                src="/avax.svg"
                alt="avax-icon"
                width={256}
                height={256}
                className="size-4"
              />
              <p className="font-semibold text-orange-500 underline">
                Avalanche
              </p>
            </div>
          </div>
        </div>
        <Link
          href={getMultiChainExplorerUrl(activeAccount?.address || "")}
          target="_blank"
          rel="noopener noreferrer"
          className={`${activeAccount?.address ? "block" : "hidden"}`}
        >
          <Button
            variant="link"
            className={`${activeAccount?.address ? "flex" : "hidden"} items-center gap-1 text-sm font-semibold text-muted-foreground`}
          >
            Multichain Portfolio
            <HugeiconsIcon icon={ArrowRight02FreeIcons} />
          </Button>
        </Link>
      </div>
      <QuickActions />
    </div>
  )
}
