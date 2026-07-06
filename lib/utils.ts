import { clsx, type ClassValue } from "clsx"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { twMerge } from "tailwind-merge"
import { createThirdwebClient } from "thirdweb"
import { envConfig } from "@/lib/env"

export {
  envConfig,
  getActivePaymentChain,
  getKotaniBaseUrl,
  getPaymentNetworkLabel,
  isAvalanchePaymentChain,
  resolveExplorerUrl,
  resolvePaymentChainId,
  resolvePaymentNetworkFamily,
  resolvePaymentRpcUrl,
  resolvePaymentUsdcContractAddress,
} from "@/lib/env"

export { getLinkImageURL } from "@/lib/link-assets"

export const HEDERA_HTS_ADDR = "0x0000000000000000000000000000000000000167"

export const client = createThirdwebClient({
  clientId: envConfig.THIRDWEB_CLIENT_ID,
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function onNavigate(path: string, router: AppRouterInstance) {
  router.push(path)
}

export function getGreetingBasedOnCurrentTime(): string {
  const timeNow = Date.now()

  const hour = new Date(timeNow).getHours()

  if (hour < 12) {
    return "morning"
  } else if (hour < 18 && hour > 12) {
    return "afternoon"
  } else {
    return "evening"
  }
}

export function getCurrentMonthName() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const now = new Date()
  return months[now.getMonth()]
}

type ExpectedDateFormat = "full" | "month-and-year" | "month-only" | "year"

export function getReadableDateTime(
  format: ExpectedDateFormat,
  timestamp: string | undefined
): string {
  if (!timestamp) return ""
  const date = new Date(timestamp)
  switch (format) {
    case "month-and-year":
      return date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
    case "month-only":
      return date.toLocaleString("en-US", {
        month: "long",
      })
    case "year":
      return date.toLocaleString("en-US", {
        year: "numeric",
      })
    default:
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        month: "long",
        year: "numeric",
      })
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export function getUserAvatarURL(url: string | null | undefined) {
  if (!url) return "/logo.png"
  return url
}

export const getMultiChainExplorerUrl = (param: string) => {
  return `https://blockscan.com/address/${param}`
}
