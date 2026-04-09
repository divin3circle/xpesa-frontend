import { clsx, type ClassValue } from "clsx"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { twMerge } from "tailwind-merge"
import { createThirdwebClient } from "thirdweb"

export const envConfig = {
  THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
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
