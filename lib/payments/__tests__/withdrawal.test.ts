import { describe, it, expect } from "vitest"
import {
  withdrawalRequestSchema,
  isTerminalWithdrawalStatus,
} from "@/lib/payments/withdrawal"

describe("withdrawal domain", () => {
  it("accepts a valid mobile-money withdrawal request and defaults currency to KES", () => {
    const parsed = withdrawalRequestSchema.parse({
      amountUsdc: 10,
      mpesaNumber: "0712345678",
      network: "mpesa",
      idempotencyKey: "abc-123",
    })
    expect(parsed.fiatCurrency).toBe("KES")
    expect(parsed.amountUsdc).toBe(10)
  })

  it("rejects non-positive amounts", () => {
    expect(() =>
      withdrawalRequestSchema.parse({
        amountUsdc: 0,
        mpesaNumber: "0712345678",
        network: "mpesa",
        idempotencyKey: "x",
      })
    ).toThrow()
  })

  it("rejects an unsupported network", () => {
    expect(() =>
      withdrawalRequestSchema.parse({
        amountUsdc: 5,
        mpesaNumber: "0712345678",
        network: "paypal",
        idempotencyKey: "x",
      })
    ).toThrow()
  })

  it("marks terminal statuses", () => {
    expect(isTerminalWithdrawalStatus("paid")).toBe(true)
    expect(isTerminalWithdrawalStatus("failed")).toBe(true)
    expect(isTerminalWithdrawalStatus("refunded")).toBe(true)
    expect(isTerminalWithdrawalStatus("requested")).toBe(false)
    expect(isTerminalWithdrawalStatus("onchain_sent")).toBe(false)
  })
})
