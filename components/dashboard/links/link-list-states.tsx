import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LinkSkeleton() {
  return (
    <div className="w-full rounded-2xl border p-4">
      <div className="my-2 flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <div className="flex w-1/2 items-center justify-between gap-1 md:w-1/3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <Skeleton className="mt-4 h-5 w-1/2" />
    </div>
  )
}

export function LinkListMessage({
  children,
  danger,
}: {
  children: string
  danger?: boolean
}) {
  return (
    <Card>
      <CardContent
        className={`py-8 text-sm ${
          danger ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {children}
      </CardContent>
    </Card>
  )
}
