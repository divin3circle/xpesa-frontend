import Image from "next/image"

import type { FiatPaymentMethod } from "@/lib/payments/fiat"

export function FlowHeader({ method }: { method: FiatPaymentMethod }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">
          {method === "mobile_money" ? "Mobile money" : "Bank transfer"}
        </p>
        <p className="text-xs text-muted-foreground">
          Powered by Kotani Pay. Access unlocks after USDC settlement.
        </p>
      </div>
      {method === "mobile_money" ? (
        <Image src="/mpesa.png" alt="Mobile money" width={34} height={34} />
      ) : null}
    </div>
  )
}
