import { Suspense } from "react"
import ClientError from "@/components/error/client-error"

function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  return (
    <Suspense fallback={<>....</>}>
      <ClientError searchParams={searchParams} />
    </Suspense>

  )
}

export default ErrorPage
