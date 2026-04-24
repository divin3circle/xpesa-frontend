import { clsx, type ClassValue } from "clsx"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { twMerge } from "tailwind-merge"
import { createThirdwebClient } from "thirdweb"
import packImage from "@/public/pack.jpg"
import packImage1 from "@/public/pack1.avif"
import documentImage from "@/public/docs.webp"
import gateLinkImage from "@/public/links.avif"
import tipsImage from "@/public/tips.png"
import { VisitorsChart } from "@/components/creator-public/visitors-chart"
import { LinkTypeChart } from "@/components/creator-public/top-type-chart"
import { AveragePriceChart } from "@/components/creator-public/average-price-chart"
import { LinksChart } from "@/components/creator-public/links-chart"
import { PlatformFeesChart } from "@/components/creator-public/platform-fees-chart"
import { ConversionRateChart } from "@/components/creator-public/conversion-rate-chart"

export const imageAssets = {
  PACK: packImage,
  PACK1: packImage1,
  DOCUMENT: documentImage,
  GATE_LINK: gateLinkImage,
  TIPS: tipsImage,
}

export const envConfig = {
  THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  AVATARS_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/",
  CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID || "",
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || "",
  R2_TOKEN_VALUE: process.env.R2_TOKEN_VALUE || "",
  R2_ENDPOINT: process.env.R2_ENDPOINT || "",
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "",
  ENV: process.env.ENV || "DEV",
  FEE: process.env.FEE || "5"
}

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
  const currentMonthName = months[now.getMonth()]

  return currentMonthName
}

type ExpectedDateFormat = "full" | "month-and-year" | "month-only" | "year"

export function getReadableDateTime(
  formart: ExpectedDateFormat,
  timestamp: string | undefined
): string {
  if (!timestamp) return ""
  const date = new Date(timestamp)
  switch (formart) {
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

export function getLinkImageURL(type: string) {
  switch (type) {
    case "pack":
      return imageAssets.PACK
    case "document":
      return imageAssets.DOCUMENT
    case "gate":
      return imageAssets.GATE_LINK
    case "tip":
      return imageAssets.TIPS
    default:
      return imageAssets.GATE_LINK
  }
}

export function renderRelevantChart(analyticsType: string) {
  switch (analyticsType) {
    case "active-links":
      return LinksChart()
    case "average-price":
      return AveragePriceChart()
    case "primary-content":
      return LinkTypeChart()
    case "unique-supporters":
      return VisitorsChart()
    case "total-fees":
      return PlatformFeesChart()
    case "conversion-rate":
      return ConversionRateChart()
    default:
      return null
  }
}
