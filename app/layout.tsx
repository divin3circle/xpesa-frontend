import { Geist_Mono, Space_Grotesk, Oxanium } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

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

export const metadata = {
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
        <TooltipProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
