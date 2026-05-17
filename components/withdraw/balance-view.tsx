import QuickActions from "./quick-actions"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight02FreeIcons } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function WithdrawBalanceView() {
  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="my-4 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground md:text-base">
            USDC Balance
          </p>
          <div className="text-heading flex items-end text-4xl font-semibold md:text-6xl">
            <h1>$</h1>
            <h1>23,567</h1>.
            <h1 className="text-xl text-muted-foreground md:text-3xl">84</h1>
          </div>
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
        <Link href={"/buy"}>
          <Button variant="link" className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
            Multichain Portfolio
            <HugeiconsIcon icon={ArrowRight02FreeIcons} />
          </Button>
        </Link>
      </div>
      <QuickActions />
    </div>
  )
}