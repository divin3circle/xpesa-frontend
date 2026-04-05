"use client"

import { LoginForm } from "@/components/login-form"

import LottieComponent from "@/components/lottie-animation"
import { BrandLogo } from "@/components/landing/brand-logo"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <BrandLogo />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <LottieComponent page="login" />
      </div>
    </div>
  )
}
