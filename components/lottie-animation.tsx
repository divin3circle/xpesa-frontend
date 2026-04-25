"use client"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export default function LottieComponent({
  page,
}: {
  page: "login" | "signup" | "confirmed"
}) {
  return (
    <DotLottieReact
      src={page === "login" ? "/login.json" : page === "signup" ? "/signup.json" : "/confirmed.json"}
      loop
      autoplay
    />
  )
}
