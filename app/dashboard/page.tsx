"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreatorTransactionsTable } from "@/components/ui/creator-transactions-table"

import { useUserDetails } from "@/hooks/use-user"
import LoadingSpinner from "@/components/ui/loading-spinner"
import {
  getCurrentMonthName,
  getGreetingBasedOnCurrentTime,
  getReadableDateTime,
} from "@/lib/utils"
import { useGetAllTimeEarnings } from "@/hooks/use-stats"
import { redirect } from "next/navigation"
import { useMyLinks } from "@/hooks/use-links"
import { useTransactionsByCreatorId } from "@/hooks/use-transactions"

export default function Page() {
  const { data, isLoading, error } = useUserDetails()
  const { data: links, isLoading: isLinksLoading } = useMyLinks()
  const {
    data: allTimeEarningsData,
    isLoading: isAllTimeEarningsLoading,
    error: allTimeEarningsError,
  } = useGetAllTimeEarnings()
  const { data: creatorTxns, isLoading: isTxnsLoading } =
    useTransactionsByCreatorId(data?.creator?.id, 7)

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="mb- font-sans font-semibold text-muted-foreground">
          Just a moment..
        </h1>
        <LoadingSpinner size={5} />
      </div>
    )
  }

  if (error) {
    redirect(`/error?q=${error.message}`)
  }
  if (allTimeEarningsError) {
    redirect(
      `/error?q=${allTimeEarningsError?.message || "Failed to load earnings data"}`
    )
  }
  if (!allTimeEarningsData || !data) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="mb- font-sans font-semibold text-muted-foreground">
          Just a moment..
        </h1>
        <LoadingSpinner size={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Good {getGreetingBasedOnCurrentTime()}, {data?.creator?.display_name}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Here is a live snapshot of your earnings, links, and payout readiness.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>All Time Earnings</CardDescription>
            {isAllTimeEarningsLoading ? (
              <div className="my-2 flex items-center justify-start font-heading text-3xl font-semibold text-muted-foreground">
                $<LoadingSpinner size={5} />
                <LoadingSpinner size={5} />.
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
              </div>
            ) : (
              <CardTitle className="font-heading text-3xl">
                ${allTimeEarningsData?.allTimeEarnings}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Since{" "}
            {getReadableDateTime("month-and-year", data.creator?.created_at)}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            {isAllTimeEarningsLoading ? (
              <div className="my-2 flex items-center justify-start font-heading text-3xl font-semibold text-muted-foreground">
                $<LoadingSpinner size={5} />
                <LoadingSpinner size={5} />.
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
              </div>
            ) : (
              <CardTitle className="font-heading text-3xl">
                ${allTimeEarningsData?.thisMonthEarnings}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Amount earned in {getCurrentMonthName()}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Transactions Count</CardDescription>
            {isAllTimeEarningsLoading ? (
              <div className="my-2 flex items-center justify-start font-heading text-3xl font-semibold text-muted-foreground">
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
              </div>
            ) : (
              <CardTitle className="font-heading text-3xl">
                {allTimeEarningsData?.allTimeTransactions}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Since{" "}
            {getReadableDateTime("month-and-year", data.creator?.created_at)}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Active Links</CardDescription>
            {isLinksLoading ? (
              <div className="my-2 flex items-center justify-start font-heading text-3xl font-semibold text-muted-foreground">
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
                <LoadingSpinner size={5} />
              </div>
            ) : (
              <CardTitle className="font-heading text-3xl">
                {links?.links.length || 0}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Since{" "}
            {getReadableDateTime("month-and-year", data.creator?.created_at)}
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 overflow-scroll">
        <CreatorTransactionsTable
          title="Your Transactions"
          className="lg:col-span-3"
          transactions={creatorTxns?.transactions ?? []}
          isLoading={isTxnsLoading}
        />
      </section>
    </div>
  )
}
