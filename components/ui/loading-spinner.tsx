import { cn } from "@/lib/utils"
import Image from "next/image"

interface LoadingSpinnerProps {
  size?: number
}

function LoadingSpinner({ size = 4 }: LoadingSpinnerProps) {
  return (
    <div className={cn(`w-${size} h-${size}`)}>
      <Image
        src="/logo.png"
        alt="Loading..."
        width={size * 20}
        height={size * 16}
        className="size animate-spin rounded-full"
      />
    </div>
  )
}

export default LoadingSpinner
