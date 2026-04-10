"use client"
import { Button } from "@/components/ui/button"
import { onNavigate } from "@/lib/utils"
import { ReloadIcon } from "hugeicons-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"

function ErrorPage() {
  const router = useRouter()
  const errorMessage =
    useSearchParams().get("message") || "An unexpected error occurred."
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <p className="text-lg font-medium">Whoops! That didn&apos;t work.</p>
      <Image
        src="/error.png"
        alt="Error"
        width={300}
        height={200}
        className="my-6"
      />
      <p className="font-sans font-semibold text-destructive">Reason:</p>
      <p className="font-sans text-muted-foreground">{errorMessage}</p>
      <Button
        variant="outline"
        className="mt-4 w-full md:w-1/3"
        onClick={() => onNavigate("/login", router)}
      >
        <ReloadIcon className="mr-2" />
        Try Again
      </Button>
    </div>
  )
}

export default ErrorPage
