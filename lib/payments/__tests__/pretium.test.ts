import { describe, it, expect } from "vitest"
import { createPretiumProvider } from "@/lib/payments/providers/pretium"

describe("PretiumProvider (pure logic)", () => {
  it("has a stable provider id", () => {
    expect(createPretiumProvider({ apiKey: "k" }).id).toBe("pretium")
  })

  it("is enabled only when a key is present and the flag is on", () => {
    expect(createPretiumProvider({ apiKey: "", enabled: true }).enabled).toBe(false)
    expect(createPretiumProvider({ apiKey: "k", enabled: true }).enabled).toBe(true)
    expect(createPretiumProvider({ apiKey: "k", enabled: false }).enabled).toBe(false)
  })

  it("treats webhooks as unsigned (verification is a no-op; route reconciles via status)", () => {
    const p = createPretiumProvider({ apiKey: "k" })
    expect(
      p.verifyWebhookSignature({ payload: {}, headerSignature: null })
    ).toEqual({ ok: true })
  })

  it("normalizes a transaction webhook payload", () => {
    const p = createPretiumProvider({ apiKey: "k" })
    const e = p.parseWebhookEvent({
      status: "COMPLETE",
      transaction_code: "abc123",
      receipt_number: "QJK7",
      message: "ok",
    })
    expect(e).toMatchObject({
      providerEventId: "abc123",
      providerReference: "abc123",
      rawStatus: "COMPLETE",
    })
  })

  it("resolves a per-chain offramp settlement address from env", async () => {
    process.env.PRETIUM_SETTLEMENT_ADDRESS_BASE = "0xBaseSettlement"
    process.env.PRETIUM_SETTLEMENT_ADDRESS_AVALANCHE = "0xAvaxSettlement"
    const p = createPretiumProvider({ apiKey: "k" })
    await expect(p.getOfframpSettlementAddress("BASE")).resolves.toBe(
      "0xBaseSettlement"
    )
    await expect(p.getOfframpSettlementAddress("AVALANCHE")).resolves.toBe(
      "0xAvaxSettlement"
    )
  })

  it("throws a clear error when no settlement address is configured", async () => {
    const p = createPretiumProvider({ apiKey: "k" })
    await expect(p.getOfframpSettlementAddress("CELO")).rejects.toThrow(
      /settlement address/
    )
  })
})
