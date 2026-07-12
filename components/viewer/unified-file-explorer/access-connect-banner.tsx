"use client"

import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarAward01FreeIcons } from "@hugeicons/core-free-icons"

export function AccessConnectBanner() {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className="mb-8 overflow-hidden"
    >
      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full p-2">
            <HugeiconsIcon icon={StarAward01FreeIcons} />
          </div>
          <div>
            <p className="text-sm font-semibold">Connect Fan Wallet</p>
            <p className="text-xs text-muted-foreground">
              Connect your wallet to verify ownership and access this content
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
