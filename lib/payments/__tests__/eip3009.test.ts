import { describe, it, expect } from "vitest"
import {
  buildAuthorization,
  buildTransferWithAuthorizationTypedData,
} from "@/lib/payments/eip3009"

describe("eip3009", () => {
  it("encodes USDC value to 6-decimal base units and a bounded validity window", () => {
    const auth = buildAuthorization({
      from: "0xFrom",
      to: "0xEsc",
      valueUsdc: 12.5,
      ttlSeconds: 600,
    })
    expect(auth.value).toBe("12500000") // 12.5 * 1e6
    expect(auth.validAfter).toBe(0)
    expect(auth.validBefore - Math.floor(Date.now() / 1000)).toBeGreaterThan(500)
    expect(auth.nonce).toMatch(/^0x[0-9a-fA-F]{64}$/)
  })

  it("uses a fresh nonce each call", () => {
    const a = buildAuthorization({ from: "0xa", to: "0xb", valueUsdc: 1 })
    const b = buildAuthorization({ from: "0xa", to: "0xb", valueUsdc: 1 })
    expect(a.nonce).not.toBe(b.nonce)
  })

  it("builds an EIP-712 TransferWithAuthorization payload with the correct domain", () => {
    const auth = buildAuthorization({
      from: "0xa".padEnd(42, "0"),
      to: "0xb".padEnd(42, "0"),
      valueUsdc: 1,
    })
    const td = buildTransferWithAuthorizationTypedData({
      authorization: auth,
      chainId: 43114,
      usdcAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      tokenName: "USD Coin",
      tokenVersion: "2",
    })
    expect(td.primaryType).toBe("TransferWithAuthorization")
    expect(td.domain).toMatchObject({
      name: "USD Coin",
      version: "2",
      chainId: 43114,
      verifyingContract: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    })
    expect(td.types.TransferWithAuthorization.map((f) => f.name)).toEqual([
      "from",
      "to",
      "value",
      "validAfter",
      "validBefore",
      "nonce",
    ])
    expect(td.message).toMatchObject({
      from: auth.from,
      to: auth.to,
      value: auth.value,
    })
  })
})
