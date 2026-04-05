"use client"

import LottieComponent from "@/components/lottie-animation"
import { BrandLogo } from "@/components/landing/brand-logo"
import PasswordResetForm from "@/components/password-reset-form"

export default function PasswordResetPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <BrandLogo />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <PasswordResetForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <LottieComponent page="login" />
      </div>
    </div>
  )
}
