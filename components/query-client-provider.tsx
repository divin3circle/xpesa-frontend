"use client"

import {
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import React from "react"

const queryClient = new QueryClient()

export function AppQueryClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export function useAppQueryClient() {
  return useQueryClient()
}

export function useInvalidateAppQuery({
  queryKey,
}: {
  queryKey: undefined | unknown[]
}) {
  const queryClient = useAppQueryClient()
  return () => queryClient.invalidateQueries({ queryKey })
}
