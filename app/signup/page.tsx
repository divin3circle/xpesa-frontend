"use client"

import { SignupForm } from "@/components/signup-form"
import LottieComponent from "@/components/lottie-animation"
import { BrandLogo } from "@/components/landing/brand-logo"
import { useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignupPage() {

  useEffect(() => {
    toast.info("Signup currently unavailable", {
      description: "Join the waitlist or express your interest below.",
      action: <Link href={"/waitlist"}>
        <Button variant={"ghost"}>Join Waitlist</Button>
      </Link>
    })
  }, [])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <BrandLogo tone="default" />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <LottieComponent page="signup" />
      </div>
    </div>
  )
}
