"use client"

import { useQuery } from "@tanstack/react-query"

export type KotaniRatesResponse = any

export function useKotaniRates(
  destinationCurrency?: string,
  sourceCurrency = "USDC",
  queryOptions: Omit<
    Parameters<typeof useQuery<KotaniRatesResponse>>[0],
    "queryKey" | "queryFn"
  > = {}
) {
  const enabled = Boolean(destinationCurrency)

  return useQuery<KotaniRatesResponse>({
    queryKey: ["kotani-rates", sourceCurrency, destinationCurrency],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("source", sourceCurrency)
      if (destinationCurrency) params.set("destination", destinationCurrency)

      const res = await fetch(`/api/kotani/rates?${params.toString()}`)
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Kotani rates error: ${res.status} ${text}`)
      }
      return res.json()
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    ...queryOptions,
  })
}
