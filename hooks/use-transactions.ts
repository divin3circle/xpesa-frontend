import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import type {
  GetPublicTransactionsResponse,
  PublicTransaction,
  PublicTransactionsErrorResponse,
  PublicTransactionStatus,
} from "@/app/api/public/transactions/route"

type TransactionsFilter = {
  id?: string
  creatorId?: string
  linkId?: string
  status?: PublicTransactionStatus
  limit?: number
}

function buildQueryString(filter: TransactionsFilter) {
  const params = new URLSearchParams()

  if (filter.id) params.set("id", filter.id)
  if (filter.creatorId) params.set("creatorId", filter.creatorId)
  if (filter.linkId) params.set("linkId", filter.linkId)
  if (filter.status) params.set("status", filter.status)
  if (filter.limit) params.set("limit", String(filter.limit))

  return params.toString()
}

async function getTransactions(
  filter: TransactionsFilter = {}
): Promise<GetPublicTransactionsResponse> {
  const queryString = buildQueryString(filter)
  const url = queryString
    ? `/api/public/transactions?${queryString}`
    : "/api/public/transactions"

  const response = await fetch(url)

  if (!response.ok) {
    const error: PublicTransactionsErrorResponse = await response.json()
    throw new Error(error.error || "Failed to fetch transactions")
  }

  return response.json()
}

export function useAllTransactions(limit = 50) {
  return useQuery({
    queryKey: ["transactions", "all", limit],
    queryFn: () => getTransactions({ limit }),
    staleTime: 1000 * 60,
  })
}

export function useTransactionById(id: string | null | undefined) {
  const query = useQuery({
    queryKey: ["transactions", "id", id],
    queryFn: () => getTransactions({ id: id!, limit: 1 }),
    enabled: !!id,
    staleTime: 1000 * 60,
  })

  const transaction = useMemo(
    () => query.data?.transactions?.[0] ?? null,
    [query.data?.transactions]
  )

  return { ...query, transaction }
}

export function useTransactionsByCreatorId(
  creatorId: string | null | undefined,
  limit = 50
) {
  return useQuery({
    queryKey: ["transactions", "creator", creatorId, limit],
    queryFn: () => getTransactions({ creatorId: creatorId!, limit }),
    enabled: !!creatorId,
    staleTime: 1000 * 60,
  })
}

export function useTransactionsByLinkId(
  linkId: string | null | undefined,
  limit = 50
) {
  return useQuery({
    queryKey: ["transactions", "link", linkId, limit],
    queryFn: () => getTransactions({ linkId: linkId!, limit }),
    enabled: !!linkId,
    staleTime: 1000 * 60,
  })
}

export function useConfirmedTransactionsByLinkId(
  linkId: string | null | undefined,
  limit = 50
) {
  return useQuery({
    queryKey: ["transactions", "link-confirmed", linkId, limit],
    queryFn: () =>
      getTransactions({
        linkId: linkId!,
        status: "confirmed",
        limit,
      }),
    enabled: !!linkId,
    staleTime: 1000 * 60,
  })
}

export function useTransactionsByStatus(
  status: PublicTransactionStatus,
  limit = 50
) {
  return useQuery({
    queryKey: ["transactions", "status", status, limit],
    queryFn: () => getTransactions({ status, limit }),
    staleTime: 1000 * 60,
  })
}

export type { PublicTransaction }
