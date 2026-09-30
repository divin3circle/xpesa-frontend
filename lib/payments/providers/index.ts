import type { FiatProvider } from "@/lib/payments/fiat-provider"
import { createPretiumProvider } from "@/lib/payments/providers/pretium"

/**
 * The active fiat provider, selected by the FIAT_PROVIDER env var.
 *
 * The rest of the app depends only on the FiatProvider interface and calls this
 * — never a concrete provider — so swapping providers is a one-line change here
 * plus its env. Add new providers to the switch.
 */
export function getFiatProvider(): FiatProvider {
  const id = process.env.FIAT_PROVIDER ?? "pretium"
  switch (id) {
    case "pretium":
      return createPretiumProvider()
    default:
      throw new Error(`Unknown FIAT_PROVIDER: "${id}"`)
  }
}
