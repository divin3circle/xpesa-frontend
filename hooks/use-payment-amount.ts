import { useMemo, useState } from "react"

type PaymentAmountSource = {
  suggested_amount_usdc?: number | null
  price_usdc?: number | null
}

function formatUsdc(value: number | null) {
  if (!value || value <= 0) return "0.00"

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function usePaymentAmount(link?: PaymentAmountSource) {
  const [amount, setAmount] = useState("")

  const defaultAmount = useMemo(
    () => formatUsdc(link?.suggested_amount_usdc ?? link?.price_usdc ?? 0),
    [link?.suggested_amount_usdc, link?.price_usdc]
  )

  const displayAmount = amount || defaultAmount

  return {
    amount,
    setAmount,
    displayAmount,
  }
}
