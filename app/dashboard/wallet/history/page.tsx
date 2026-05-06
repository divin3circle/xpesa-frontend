"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatorTransactionsTable } from "@/components/ui/creator-transactions-table"
import { Input } from "@/components/ui/input"
import LoadingSpinner from "@/components/ui/loading-spinner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTransactionsByCreatorId } from "@/hooks/use-transactions"
import { useUserDetails } from "@/hooks/use-user"

const PAGE_SIZE = 10

function DatePickerField({
  value,
  onChange,
  placeholder,
}: {
  value: Date | undefined
  onChange: (value: Date | undefined) => void
  placeholder: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-start rounded-md border border-input bg-background px-3 text-left font-normal"
        >
          {value ? format(value, "MMM dd, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  )
}

export default function TransactionHistoryPage() {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [status, setStatus] = useState("all")
  const [network, setNetwork] = useState("all")
  const [search, setSearch] = useState("")

  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useUserDetails()
  const creatorId = userData?.creator?.id

  const {
    data: txData,
    isLoading: isTxLoading,
    isFetching: isTxFetching,
    error: txError,
  } = useTransactionsByCreatorId(creatorId, limit)

  const transactions = useMemo(
    () => txData?.transactions ?? [],
    [txData?.transactions]
  )

  const networkOptions = useMemo(() => {
    return Array.from(
      new Set(transactions.map((tx) => tx.network).filter(Boolean))
    ).sort()
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return transactions.filter((tx) => {
      const txDate = new Date(tx.created_at)

      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        if (txDate < start) return false
      }

      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (txDate > end) return false
      }

      if (status !== "all" && tx.status !== status) return false
      if (network !== "all" && tx.network !== network) return false

      if (normalizedSearch.length > 0) {
        const haystack = [
          tx.link_id,
          tx.fan_wallet_address,
          tx.tx_hash ?? "",
          tx.network,
        ]
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(normalizedSearch)) return false
      }

      return true
    })
  }, [transactions, startDate, endDate, status, network, search])

  const canLoadMore = transactions.length >= limit
  const hasActiveFilters =
    !!startDate ||
    !!endDate ||
    status !== "all" ||
    network !== "all" ||
    !!search.trim()

  const clearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setStatus("all")
    setNetwork("all")
    setSearch("")
  }

  if (isUserLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <LoadingSpinner size={5} />
      </div>
    )
  }

  if (userError || !creatorId) {
    return (
      <div className="rounded-xl border border-border/60 p-4 text-sm text-muted-foreground">
        Unable to load your account details right now.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Transaction history
        </h1>
        <p className="text-sm text-muted-foreground">
          Full record of all creator earnings with fees and net amount.
        </p>
      </section>

      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Filters</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear all filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <DatePickerField
            value={startDate}
            onChange={setStartDate}
            placeholder="Start date"
          />
          <DatePickerField
            value={endDate}
            onChange={setEndDate}
            placeholder="End date"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search link/wallet/hash"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={network} onValueChange={(value) => setNetwork(value)}>
            <SelectTrigger className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <SelectValue placeholder="All networks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All networks</SelectItem>
              {networkOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-none bg-transparent shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Results ({filteredTransactions.length})</CardTitle>
          {(isTxLoading || isTxFetching) && <LoadingSpinner size={4} />}
        </CardHeader>
        <CardContent className="space-y-3">
          {txError ? (
            <p className="text-sm text-muted-foreground">
              Unable to load transactions.
            </p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transactions match your filters.
            </p>
          ) : (
            <CreatorTransactionsTable
              title=""
              transactions={filteredTransactions}
              isLoading={isTxLoading || isTxFetching}
            />
          )}

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
              disabled={!canLoadMore || isTxFetching}
            >
              {isTxFetching ? "Loading..." : "Load 10 more"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
