"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

export function useViewTipCheckout(initialAmount = "5.00") {
  const [amount, setAmount] = useState(initialAmount)

  const checkout = useMutation({
    mutationFn: async () => {
      const parsedAmount = Number(amount)

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Enter a valid tip amount")
      }

      // Placeholder mutation until tip checkout endpoint is wired.
      return { amount: parsedAmount }
    },
  })

  return {
    amount,
    setAmount,
    checkout,
  }
}
