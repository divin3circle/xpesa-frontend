import { BrandLogo } from "@/components/landing/brand-logo"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function GetUSDCPage() {
  return (
    <div className="grid grid-cols-1 lg:min-h-svh lg:grid-cols-2">
      <div className="mb-8 flex flex-col items-start justify-between gap-8">
        <div className="mt-4 flex w-full items-start justify-between p-4">
          <BrandLogo tone={"default"} />
          <div className=" items-center justify-between gap-4 flex">
            <Link
              href="/"
              className="text-sm font-semibold text-muted-foreground duration-200 ease-in hover:scale-95 hover:text-foreground hover:underline"
            >
              buy
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-muted-foreground duration-200 ease-in hover:scale-95 hover:text-foreground hover:underline"
            >
              swap
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-muted-foreground duration-200 ease-in hover:scale-95 hover:text-foreground hover:underline"
            >
              bridge
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-muted-foreground duration-200 ease-in hover:scale-95 hover:text-foreground hover:underline"
            >
              faucet
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-4 px-2 md:px-4">
          <h1 className="font-heading text-3xl font-semibold lg:text-5xl">
            Buy {"&"} Exchange USDC on{" "}
            <span className="font-sans text-orange-500">Avalanche</span>{" "}
            instantly
          </h1>
          <p className="max-w-xl text-xl text-muted-foreground">
            Xydra uses Moonpay to help you buy USDC instantly using the currency
            of your choice available in more that 100+ regions with 83+
            currencies.
          </p>
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <Button variant="outline" className="w-full md:w-1/2">
              Get USDC
            </Button>
            <Button variant="default" className="w-full md:w-1/3">
              Privacy Policy
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 px-2 md:px-4">
          <div className="flex min-w-[180px] items-center gap-2 rounded-2xl border border-border/70">
            <Image
              src={"/moonpay.png"}
              alt={"moonpay"}
              height={500}
              width={500}
              className="size-20 rounded-l-2xl"
            />
            <p className="base mr-2 font-semibold text-muted-foreground">
              MoonPay
            </p>
          </div>
          <div className="flex min-w-[180px] items-center gap-2 rounded-2xl border border-border/70">
            <Image
              src={"/usdc.png"}
              alt={"usdc-icon"}
              height={500}
              width={500}
              className="size-20 rounded-l-2xl"
            />
            <p className="base mr-2 font-semibold text-muted-foreground">
              USDC
            </p>
          </div>
        </div>
      </div>
      <div className="lg:min-h-svh">
        <Image
          alt="usdc"
          height={1000}
          width={1000}
          src={"/buy4.webp"}
          className="h-full object-cover dark:brightness-[0.8]"
        />
      </div>
    </div>
  )
}
