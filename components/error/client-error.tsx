"use client"

import { use } from "react"
import { Button } from "../ui/button"
import Image from "next/image"
import { ReloadIcon } from "hugeicons-react"
import { onNavigate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

export default function ClientError({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const router = useRouter()
  const errorMessage = use(searchParams)
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
      <p className="font-sans text-muted-foreground">{errorMessage.q}</p>
      <Button
        variant="outline"
        className="mt-4 w-full md:w-1/3"
        onClick={() => onNavigate("/login", router)}
      >
        <ReloadIcon className="mr-2" />
        Try Again
      </Button>
      <Button
        variant="ghost"
        className="mt-4 w-full md:w-1/3"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon className="mr-2" />
        Go Back
      </Button>
    </div>
  )
}
