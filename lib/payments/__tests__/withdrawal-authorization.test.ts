import { describe, it, expect } from "vitest"
import {
  usdcBaseUnits,
  validateSignedAuthorization,
} from "@/lib/payments/withdrawal-authorization"
import type { TransferAuthorization } from "@/lib/payments/eip3009"

const base = (over: Partial<TransferAuthorization> = {}): TransferAuthorization => ({
  from: "0xCreator",
  to: "0xDeposit",
  value: usdcBaseUnits(10),
  validAfter: 0,
  validBefore: Math.floor(Date.now() / 1000) + 600,
  nonce: "0x" + "ab".repeat(32),
  ...over,
})

const expected = {
  from: "0xcreator",
  to: "0xdeposit",
  valueUsdc: 10,
  nonce: "0x" + "AB".repeat(32),
}

describe("usdcBaseUnits", () => {
  it("converts USDC to 6-decimal base units", () => {
    expect(usdcBaseUnits(10)).toBe("10000000")
    expect(usdcBaseUnits(0.5)).toBe("500000")
  })
})

describe("validateSignedAuthorization", () => {
  it("passes when the authorization matches the stored fields (case-insensitive)", () => {
    expect(validateSignedAuthorization(base(), expected)).toBeNull()
  })
  it("rejects a redirected recipient", () => {
    expect(validateSignedAuthorization(base({ to: "0xAttacker" }), expected)).toBe(
      "Authorization recipient mismatch"
    )
  })
  it("rejects an inflated amount", () => {
    expect(
      validateSignedAuthorization(base({ value: usdcBaseUnits(1000) }), expected)
    ).toBe("Authorization amount mismatch")
  })
  it("rejects a wrong sender", () => {
    expect(validateSignedAuthorization(base({ from: "0xSomeoneElse" }), expected)).toBe(
      "Authorization sender mismatch"
    )
  })
  it("rejects a stale nonce", () => {
    expect(
      validateSignedAuthorization(base({ nonce: "0x" + "cd".repeat(32) }), expected)
    ).toBe("Authorization nonce mismatch")
  })
  it("rejects an expired authorization", () => {
    expect(
      validateSignedAuthorization(
        base({ validBefore: Math.floor(Date.now() / 1000) - 1 }),
        expected
      )
    ).toBe("Authorization has expired")
  })
})
