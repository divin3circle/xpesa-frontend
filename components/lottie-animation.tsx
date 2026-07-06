import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import type { DotLottie } from "@lottiefiles/dotlottie-react"

export type AnimationFile =
  | "login"
  | "signup"
  | "confirmed"
  | "wallet"
  | "earn"
  | "receive"
  | "export"
  | "withdraw"

export default function LottieComponent({
  page,
  loop = true,
  autoplay = true,
  dotLottieRefCallback,
}: {
  page: AnimationFile
  loop?: boolean
  autoplay?: boolean
  dotLottieRefCallback?: (instance: DotLottie | null) => void
}) {
  return (
    <DotLottieReact
      dotLottieRefCallback={dotLottieRefCallback}
      src={`/${page}.json`}
      loop={loop}
      autoplay={autoplay}
    />
  )
}
