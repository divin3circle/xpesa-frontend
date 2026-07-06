"use client"

import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePublicLink } from "@/hooks/use-public"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BrandLogo } from "@/components/landing/brand-logo"
import LottieComponent from "@/components/lottie-animation"
import { getPaymentNetworkLabel, resolveExplorerUrl } from "@/lib/utils"
import { envConfig } from "@/lib/env"

export default function TipThankYouPage() {
  const params = useParams<{ linkId: string; txHash: string }>()
  const linkId = params?.linkId
  const searchParams = useSearchParams()
  const txHash = searchParams.get("txHash") ?? ""
  const router = useRouter()

  const { data, isLoading } = usePublicLink(linkId)
  const link = data?.link

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Skeleton className="h-64 w-full max-w-md rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 pt-10 pb-20">
      <div className="mb-12 w-full max-w-7xl">
        <BrandLogo tone="default" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="overflow-hidden border-none bg-transparent backdrop-blur-sm">
          <CardContent className="flex flex-col items-center p-8 pt-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                damping: 12,
                stiffness: 200,
                delay: 0.2,
              }}
              className="relative mb-6"
            >
              <LottieComponent page="confirmed" loop={false} />
            </motion.div>

            <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
              Payment Successful!
            </h1>
            <p className="mb-8 text-muted-foreground">
              Your support means the world to the creator.
            </p>

            <div className="mb-8 w-full rounded-2xl border border-border/40 bg-muted/30 p-6 text-left">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Amount Paid
                </span>
                <span className="font-heading text-lg font-bold text-foreground">
                  {link?.price_usdc ? `${link.price_usdc} USDC` : "Custom Tip"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/20 pt-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Transaction Status
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase">
                  Confirmed
                </span>
              </div>
            </div>

            {link?.type === "tip" && (
              <div className="mb-8 flex flex-col items-center gap-3 text-muted-foreground italic">
                <p>&quot;{link.thank_you_message}&quot;</p>
              </div>
            )}

            <div className="grid w-full gap-3">
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-2xl border-border/50 bg-transparent"
              >
                <Link href={`${envConfig.APP_URL}/creator/${link?.creatorId}`}>
                  Back to Creator
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div
          className="mt-8 flex cursor-pointer items-center justify-center gap-2 text-xs text-muted-foreground"
          onClick={() => {
            if (!txHash) return
            router.push(resolveExplorerUrl(txHash))
          }}
        >
          <span>Payment verified on {getPaymentNetworkLabel()}</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </motion.div>
    </div>
  )
}
