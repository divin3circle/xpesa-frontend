import { Geist_Mono, Space_Grotesk, Oxanium } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ThirdwebProvider } from "thirdweb/react"
import { AppQueryClientProvider } from "@/components/query-client-provider"
import { FanWalletProvider } from "@/components/fan-wallet-context"
import React from "react"

const oxaniumHeading = Oxanium({
  subsets: ["latin"],
  variable: "--font-heading",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "X-Pesa",
  description: "A creator tools platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        spaceGrotesk.variable,
        oxaniumHeading.variable
      )}
    >
      <body>
        <AppQueryClientProvider>
          <ThirdwebProvider>
            <FanWalletProvider>
              <TooltipProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      className: "rounded-2xl font-semibold font-sans",
                    }}
                  />
                </ThemeProvider>
              </TooltipProvider>
            </FanWalletProvider>
          </ThirdwebProvider>
        </AppQueryClientProvider>
      </body>
    </html>
  )
}
