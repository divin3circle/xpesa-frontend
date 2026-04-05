"use client"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export default function LottieComponent({
  page,
}: {
  page: "login" | "signup"
}) {
  return (
    <DotLottieReact
      src={page === "login" ? "/login.json" : "/signup.json"}
      loop
      autoplay
    />
  )
}
