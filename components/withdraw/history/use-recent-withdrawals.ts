"use client"

import { useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import { TABLENAMES } from "@/lib/supabase/utilities"

import { WITHDRAWAL_SELECT, type WithdrawalRecord } from "./utils"

export function useRecentWithdrawals(limit = 8) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadWithdrawals() {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (!isMounted) return

      if (userError) {
        setWithdrawals([])
        setError(userError.message)
        setIsLoading(false)
        return
      }

      if (!user) {
        setWithdrawals([])
        setIsLoading(false)
        return
      }

      const { data, error: withdrawalsError } = await supabase
        .from(TABLENAMES.WITHDRAWALS)
        .select(WITHDRAWAL_SELECT)
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (!isMounted) return

      if (withdrawalsError) {
        setWithdrawals([])
        setError(withdrawalsError.message)
      } else {
        setWithdrawals((data ?? []) as WithdrawalRecord[])
      }

      setIsLoading(false)
    }

    void loadWithdrawals()

    return () => {
      isMounted = false
    }
  }, [limit])

  return { withdrawals, isLoading, error }
}
