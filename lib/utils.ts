import { Mouse18FreeIcons } from "@hugeicons/core-free-icons";
import { clsx, type ClassValue } from "clsx"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { twMerge } from "tailwind-merge"
import { createThirdwebClient } from "thirdweb"

export const envConfig = {
  THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  AVATARS_URL: process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/"
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const now = new Date();
  const currentMonthName = months[now.getMonth()];

  return currentMonthName
}

type ExpectedDateFormat = "full" | "month-and-year" | "month-only" | "year";

export function getReadableDateTime(formart: ExpectedDateFormat, timestamp: string | undefined): string {
  if (!timestamp) return ""
  const date = new Date(timestamp)
  switch (formart) {
    case "month-and-year":
      return date.toLocaleString("en-US", {
        month: 'long',
        year: 'numeric'
      })
    case "month-only":
      return date.toLocaleString("en-US", {
        month: 'long'
      })
    case "year":
      return date.toLocaleString("en-US", {
        year: 'numeric'
      })
    default:
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        month: 'long',
        year: 'numeric'
      })
  }

}
